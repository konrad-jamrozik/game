using System.Text.Json;
using Lib.Json;
using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;

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
    protected readonly GameSession GameSession;
    private readonly Configuration _config;
    private readonly ILog _log;

    public GameSessionController(Configuration config, ILog log, GameSession gameSession)
    {
        _config = config;
        _log = log;
        GameSession = gameSession;
    }

    public RandomGen RandomGen => GameSession.RandomGen;

    public GameStatePlayerView GameStatePlayerView => new GameStatePlayerView(GameSession);

    public void AdvanceTime()
        => PlayerActions.Apply(new AdvanceTimePlayerAction(_log, RandomGen), GameSession.CurrentGameState);

    public void HireAgents(int count)
        => PlayerActions.Apply(new HireAgentsPlayerAction(_log, count), GameSession.CurrentGameState);

    public void SackAgent(int id)
        => PlayerActions.Apply(new SackAgentsPlayerAction(
                _log,
                GameSession.CurrentGameState.Assets.Agents.Single(agent => agent.Id == id).ToAgents()),
            GameSession.CurrentGameState);

    public void SendAgentsToTraining(Agents agents)
        => PlayerActions.Apply(new SendAgentsToTrainingPlayerAction(_log, agents), GameSession.CurrentGameState);

    public void SendAgentsToGenerateIncome(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGenerateIncomePlayerAction(_log, agents), GameSession.CurrentGameState);

    public void SendAgentsToGatherIntel(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGatherIntelPlayerAction(_log, agents), GameSession.CurrentGameState);


    public void RecallAgents(Agents agents)
        => PlayerActions.Apply(new RecallAgentsPlayerAction(_log, agents), GameSession.CurrentGameState);

    /// <summary>
    /// Convenience method. LaunchMission, but instead of choosing specific agents,
    /// choose up to first agentCount agents that can be sent on a mission.
    /// </summary>
    public void LaunchMission(MissionSite site, int agentCount)
    {
        Agents agents = GameStatePlayerView.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(agentCount)
            .ToAgents();

        Debug.Assert(agents.Count == agentCount);

        LaunchMission(site, agents);
    }

    public void LaunchMission(MissionSite site, Agents agents)
        => PlayerActions.Apply(new LaunchMissionPlayerAction(_log, site, agents), GameSession.CurrentGameState);

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