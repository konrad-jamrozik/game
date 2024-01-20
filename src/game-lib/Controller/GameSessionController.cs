using Lib.Json;
using UfoGameLib.State;
using Timeline = UfoGameLib.Model.Timeline;

using UfoGameLib.Lib;
using UfoGameLib.Reports;

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
/// 1. A human player calls the CLI executable built from game-cli.
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

    public GameStatePlayerView CurrentGameStatePlayerView 
        => new GameStatePlayerView(() => GameSession.CurrentGameState);

    public GameStatePlayerView[] AllGameStatesPlayerViews()
        => GameSession
            .AllGameStates
            .AtTurnStarts()
            .Select(gs => new GameStatePlayerView(() => gs))
            .ToArray();

    public void PlayGameSession(int turnLimit, IPlayer player)
    {
        Debug.Assert(CurrentGameStatePlayerView.CurrentTurn == Timeline.InitialTurn);
        Debug.Assert(turnLimit is >= Timeline.InitialTurn and <= GameState.MaxTurnLimit);

        GameState state = GameSession.CurrentGameState;

        while (!GameSessionOver(state, turnLimit))
        {
            _log.Info("");
            _log.Info($"===== Turn {state.Timeline.CurrentTurn}");
            _log.Info("");

            // This persists the game state at the player turn beginning.
            GameSession.AppendCurrentStateToPastStates();

            player.PlayGameTurn(CurrentGameStatePlayerView, TurnController);

            Debug.Assert(!state.IsGameOver);

            // This state diff shows what actions the player took.
            DiffPreviousAndCurrentGameState();

            // This persists the game state after the player took their actions in their turn,
            // but before the turn time was advanced.
            GameSession.AppendCurrentStateToPastStates();

            AdvanceTime();

            // This state diff shows the result of the action the player took in their turn.
            DiffPreviousAndCurrentGameState();
        }

        int lastTurn = LastTurn(state, turnLimit);

        _log.Info("");
        _log.Info(
            $"===== Game over! " +
            $"Game result: {(state.IsGameLost ? "lost" : state.IsGameWon ? "won" : "undecided")}");
        _log.Info($"Money: {state.Assets.Money}, " +
                  $"Intel: {state.Assets.Intel}, " +
                  $"Funding: {state.Assets.Funding}, " +
                  $"Upkeep: {state.Assets.Agents.UpkeepCost}, " +
                  $"Support: {state.Assets.Support}, " +
                  $"Transport cap.: {state.Assets.MaxTransportCapacity}, " +
                  $"Missions launched: {state.Missions.Count}, " +
                  $"Missions successful: {state.Missions.Successful.Count}, " +
                  $"Missions failed: {state.Missions.Failed.Count}, " +
                  $"Mission sites expired: {state.MissionSites.Expired.Count}, " +
                  $"Agents: {state.Assets.Agents.Count}, " +
                  $"Terminated agents: {state.TerminatedAgents.Count}, " + 
                  $"Turn: {lastTurn} / {turnLimit}.");

        SaveCurrentGameStateToFile();

        new GameSessionStatsReport(
                _log,
                GameSession,
                _config.TurnReportCsvFile,
                _config.AgentReportCsvFile,
                _config.MissionSiteReportCsvFile,
                lastTurn)
            .Write();

        _log.Flush();
    }

    public void AdvanceTime()
        => PlayerActions.Apply(new AdvanceTimePlayerAction(_log, GameSession.RandomGen), GameSession.CurrentGameState);

    public GameState SaveCurrentGameStateToFile()
    {
        GameSession.CurrentGameState.ToJsonFile(_config.SaveFile);
        _log.Info($"Saved game state to {_config.SaveFile.FullPath}");
        return GameSession.CurrentGameState;
    }

    public GameState LoadCurrentGameStateFromFile()
    {
        GameSession.AppendCurrentStateToPastStates();
        GameSession.CurrentGameState = GameState.FromJsonFile(_config.SaveFile);
        _log.Info($"Loaded game state from {_config.SaveFile.FullPath}");
        return GameSession.CurrentGameState;
    }

    private static bool GameSessionOver(GameState state, int turnLimit)
        => state.IsGameOver || state.Timeline.CurrentTurn > turnLimit;

    /// <summary>
    /// If game is over the last turn is 'current turn minus one' instead of 'current turn'.
    /// This is because UfoGameLib.Controller.AdvanceTimePlayerAction.Apply
    /// advances the turn to a turn beyond the turn in which the game ended. If we would
    /// use that turn number the reported stats would be incorrect. E.g. when the game
    /// turn limit was 5, the Timeline.CurrentTurn would be 6, even though in reality
    /// player never get a chance to even see turn 6.
    /// We don't prevent the turn advancement even when game is over to keep
    /// the turn number consistent.
    /// </summary>
    private static int LastTurn(GameState state, int turnLimit)
    {
        Debug.Assert(GameSessionOver(state, turnLimit));
        return state.Timeline.CurrentTurn - 1;
    }

    private void DiffPreviousAndCurrentGameState()
    {
        Debug.Assert(GameSession.PreviousGameState != null);
        // Note we do here !ReferenceEquals, not !Equals, because if the player did absolutely nothing
        // (see e.g. DoNothingAIPlayer), then these states will be the same.
        Debug.Assert(!ReferenceEquals(GameSession.PreviousGameState, GameSession.CurrentGameState));
        GameState prev = GameSession.PreviousGameState;
        GameState curr = GameSession.CurrentGameState;
        new GameStateDiff(prev, curr).PrintTo(_log);
    }
}