using System.Text.Json;
using Lib.Json;
using Lib.OS;
using UfoGameLib.Model;

namespace UfoGameLib.Infra;

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
    private readonly Configuration _config = new Configuration(new FileSystem());

    public GameSessionController(GameSession gameSession)
    {
        GameSession = gameSession;
    }

    public Random Random => GameSession.Random;

    public GameStatePlayerView GameStatePlayerView => new GameStatePlayerView(GameSession);

    public void AdvanceTime()
        => GameSession.ApplyPlayerAction(new AdvanceTimePlayerAction());

    public void HireAgents(int count)
        => GameSession.ApplyPlayerAction(new HireAgentsPlayerAction(count));

    public void FireAgents(IEnumerable<string> agentNames)
        => throw new NotImplementedException();

    public void SendAgentToTraining(Agent agent)
        => GameSession.ApplyPlayerAction(new SendAgentToTrainingPlayerAction(agent));

    public void SendAgentToGatherIntel(Agent agent)
        => GameSession.ApplyPlayerAction(new SendAgentToGatherIntelPlayerAction(agent));

    public void SendAgentToGenerateIncome(Agent agent)
        => GameSession.ApplyPlayerAction(new SendAgentToGenerateIncomePlayerAction(agent));

    public void RecallAgent(Agent agent)
        => GameSession.ApplyPlayerAction(new RecallAgentPlayerAction(agent));

    /// <summary>
    /// Convenience method. LaunchMission, but instead of choosing specific agents,
    /// choose up to first agentCount agents that can be sent on a mission.
    /// </summary>
    public void LaunchMission(MissionSite site, int agentCount)
    {
        List<Agent> agents = GameStatePlayerView.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(agentCount)
            .ToList();

        Debug.Assert(agents.Count == agentCount);

        LaunchMission(site, agents);
    }

    public void LaunchMission(MissionSite site, List<Agent> agents)
        => GameSession.ApplyPlayerAction(new LaunchMissionPlayerAction(site, agents));

    // kja3 introduce "SaveFile" abstraction akin to MonthlyJsonFilesStorage
    // Also, GameSession should have reference to the "SaveFile", not the GameSessionController.
    public void Save()
    {
        string saveGamePath = _config.SaveGameDir.CreateDirIfNotExists()
            .WriteAllText(
                _config.SaveFileName,
                CurrentGameStateSerializedAsJsonString());
        Console.Out.WriteLine($"Saved game state to {_config.SaveGameDir.FileSystem.GetFullPath(saveGamePath)}");
    }

    public GameState Load()
    {
        var saveGamePath = _config.SaveGameDir.JoinPath(_config.SaveFileName);
        var loadedGameState =
            _config.SaveGameDir.FileSystem.ReadAllJsonTo<GameState>(saveGamePath, SaveJsonSerializerOptions);
        
        GameSession.PreviousGameState = GameSession.CurrentGameState;
        GameSession.CurrentGameState = loadedGameState;

        Console.Out.WriteLine($"Loaded game state from {_config.SaveGameDir.FileSystem.GetFullPath(saveGamePath)}");
        return loadedGameState;
    }

    private static JsonSerializerOptions JsonSerializerOptions()
    {
        var converterOptions = GameStateJsonConverter.JsonSerializerOptions();
        var options = new JsonSerializerOptions(converterOptions);
        options.Converters.Add(new GameStateJsonConverter());
        return options;
    }

    private string CurrentGameStateSerializedAsJsonString()
        => GameSession.CurrentGameState.ToIndentedUnsafeJsonString(SaveJsonSerializerOptions);
}