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
    protected readonly GameSession GameSession;
    internal readonly Configuration Config = new Configuration(new FileSystem());

    public GameSessionController(GameSession gameSession)
    {
        GameSession = gameSession;
    }

    public GameStatePlayerView GameStatePlayerView => new GameStatePlayerView(GameSession);

    public void AdvanceTime()
        => GameSession.ApplyPlayerActions(new AdvanceTimePlayerAction());

    public void HireAgents(int count)
        => GameSession.ApplyPlayerActions(new HireAgentsPlayerAction(count));

    public void FireAgents(IEnumerable<string> agentNames)
        => throw new NotImplementedException();

    public void LaunchMission(MissionSite site, int agentCount)
        => GameSession.ApplyPlayerActions(new LaunchMissionPlayerAction(site, agentCount));

    // kja introduce "SaveFile" abstraction akin to MonthlyJsonFilesStorage
    // Also, GameSession should have reference to the "SaveFile", not the GameSessionController.
    public void Save()
    {
        string saveGamePath = Config.SaveGameDir.CreateDirIfNotExists()
            .WriteAllText(
                Config.SaveFileName,
                GameSession.CurrentGameState.ToJsonIndentedUnsafe());
        Console.Out.WriteLine($"Saved game state to {Config.SaveGameDir.FileSystem.GetFullPath(saveGamePath)}");
    }

    public GameState Load()
    {
        var saveGamePath = Config.SaveGameDir.JoinPath(Config.SaveFileName);
        var loadedGameState =
            Config.SaveGameDir.FileSystem.ReadAllJsonTo<GameState>(saveGamePath);
        GameSession.CurrentGameState = loadedGameState;
        Console.Out.WriteLine($"Loaded game state from {Config.SaveGameDir.FileSystem.GetFullPath(saveGamePath)}");
        return loadedGameState;

    }
}