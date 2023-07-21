using System.Text.Json;
using Lib.Json;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

/// <summary>
/// Represents means for controlling GameSession, to be called by client logic (e.g. CLI) acting on behalf of
/// a player, whether human or automated.
///
/// Provides following features, as compared to accessing GameSession directly:
/// - Convenient methods representing player actions that are translated by the controller
/// to underlying low-level GameSession methods invocations.
/// - Restricted Read/Write access to the GameSession. Notably, a player should not be able
/// to read entire game session state, only parts visible to them.
///
/// Here are few scenarios of using GameSessionController:
///
/// 1. A human player calls the CLI executable built from ufo-game-cli.
/// The implementation of that executable, Program.cs, translates the CLI commands to invocations
/// of GameSessionController methods. The output of these methods is returned through Program.cs to the human player.
/// 2. As 1. but the CLI commands are called not by a human, but by an automated process (aka automated player).
/// 3. The CLI executable is used by human player to launch a game session using an AI player.
/// As a result, the CLI program ends up instantiating AIPlayer instance which then plays through the game by
/// invoking methods on GameSessionController.
/// 4. As 3. but the CLI commands are called not by a human, but by an automated process (aka automated player).
///
/// The scenarios above can be visualized as follows, where "--" should be read as:
///   "Left side invokes right side, and right side returns output to the left side".
///
/// ```
/// 1. Human player     -- CLI executable -- Program --             GameSessionController -- GameSession
/// 2. Automated player -- CLI executable -- Program --             GameSessionController -- GameSession
/// 3. Human player     -- CLI executable -- Program -- AIPlayer -- GameSessionController -- GameSession
/// 4. Automated player -- CLI executable -- Program -- AIPlayer -- GameSessionController -- GameSession
/// ```
/// </summary>
public class GameSessionController
{
    public static readonly JsonSerializerOptions SaveJsonSerializerOptions = JsonSerializerOptions();
    public readonly GameTurnController TurnController;
    protected readonly GameSession GameSession;
    private readonly Configuration _config;
    private readonly ILog _log;

    public GameSessionController(Configuration config, ILog log, GameSession gameSession)
    {
        _config = config;
        _log = log;
        GameSession = gameSession;
        TurnController = new GameTurnController(_log, GameSession.RandomGen, GameSession.CurrentGameState);
    }

    public GameStatePlayerView GameStatePlayerView => new GameStatePlayerView(GameSession);

    public void PlayGameSession(int turnLimit, IPlayer player)
    {
        Debug.Assert(GameStatePlayerView.CurrentTurn == Timeline.InitialTurn);
        Debug.Assert(turnLimit is >= Timeline.InitialTurn and <= GameState.MaxTurnLimit);

        GameState state = GameSession.CurrentGameState;

        while (!state.IsGameOver && state.Timeline.CurrentTurn < turnLimit)
        {
            // This persists the game state at player turn beginning.
            PersistGameStateAsPrevious();

            player.PlayGameTurn(GameStatePlayerView, TurnController);

            // This state diff shows what actions the player took.
            DiffPreviousAndCurrentGameState();

            // This persists the game state after the player took their actions in their turn,
            // but before the turn time was advanced.
            PersistGameStateAsPrevious();

            AdvanceTime();

            // This state diff shows the result of the action the player took in their turn.
            DiffPreviousAndCurrentGameState();
        }

        // kja read all the previous diff reports and create game timeline json report for various entities, like 
        // player resource stats and agents whereabouts.
        // Dump the data to Csv, so it can be post-processed, e.g. by Excel. Maybe TabularData from lib will help.
        // In Excel, all one will have to do is to hit refresh on the data sources once the simulation reruns
        // and dumps results to .csv files.

        _log.Info($"Game over! " +
                  $"Game result: {(state.IsGameLost ? "lost" : state.IsGameWon ? "won" : "undecided")}, " +
                  $"money: {state.Assets.Money}, " +
                  $"intel: {state.Assets.Intel}, " +
                  $"funding: {state.Assets.Funding}, " +
                  $"support: {state.Assets.Support}, " +
                  $"turn: {state.Timeline.CurrentTurn} / {turnLimit}.");

        Save();
    }

    private void DiffPreviousAndCurrentGameState()
    {
        Debug.Assert(GameSession.PreviousGameState != null);
        Debug.Assert(GameSession.PreviousGameState != GameSession.CurrentGameState);
        GameState prev = GameSession.PreviousGameState;
        GameState curr = GameSession.CurrentGameState;
        new GameStateDiff(prev, curr).PrintTo(_log);
    }

    private void PersistGameStateAsPrevious()
        => GameSession.PreviousGameState = GameSession.CurrentGameState.Clone(SaveJsonSerializerOptions);

    public void AdvanceTime()
        => PlayerActions.Apply(new AdvanceTimePlayerAction(_log, GameSession.RandomGen), GameSession.CurrentGameState);

    // kja3 introduce "SerializedJsonFile" abstraction that will retain the serialization options
    public void Save()
    {
        _config.SaveFile.WriteAllText(CurrentGameStateSerializedAsJsonString());
        _log.Info($"Saved game state to {_config.SaveFile.FullPath}");
    }

    public GameState Load()
    {
        var loadedGameState =
            _config.SaveFile.FromJsonTo<GameState>(SaveJsonSerializerOptions);

        GameSession.PreviousGameState = GameSession.CurrentGameState;
        GameSession.CurrentGameState = loadedGameState;

        _log.Info($"Loaded game state from {_config.SaveFile.FullPath}");
        return loadedGameState;
    }

    private static JsonSerializerOptions JsonSerializerOptions()
    {
        // The difference between the returned options and converterOptions
        // is that options has Converters defined, while converterOptions
        // doesn't. If instead we would try to use options in place
        // of converterOptions, then we will would end up in infinite loop of:
        // options --> have converter --> the converter has options -->
        // these options have converter --> ...
        //
        // Note that the JsonStringEnumConverter() defined within converterOptions
        // is a "leaf" Converter in the sense it doesn't need any other of the settings
        // defined in the options of which it is part of.

        // Define "base" JsonSerializerOptions that do not have Converters defined.
        var converterOptions = GameStateJsonConverter.JsonSerializerOptions();

        // Define the "top-level" options to be returned, having the same settings
        // as "converterOptions".
        var options = new JsonSerializerOptions(converterOptions);

        // Attach Converters to "options" but not "converterOptions"
        options.Converters.Add(new GameStateJsonConverter());


        return options;
    }

    private string CurrentGameStateSerializedAsJsonString()
        => GameSession.CurrentGameState.ToIndentedUnsafeJsonString(SaveJsonSerializerOptions);
}