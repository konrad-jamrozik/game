using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Controller;

public class GameSessionStatsReport
{
    private readonly ILog _log;
    private readonly File _csvFile;
    private readonly GameSession _gameSession;


    public GameSessionStatsReport(ILog log, File csvFile, GameSession gameSession)
    {
        _log = log;
        _csvFile = csvFile;
        _gameSession = gameSession;
    }

    public void Write()
    {
        List<GameState> gameStates =
            _gameSession.PastGameStates.Concat(_gameSession.CurrentGameState.WrapInList()).ToList();

        // kja LogMissionStats
        // Includes: most bloody mission
        // Top 5 hardest missions
        // Top 5 won hardest mission
        // Top 5 missions by terminated agents
        // Top 5 won missions by terminated agents
        // Top 5 missions with least amount of agents lost
        // Top 5 lost missions with least amount of agents lost

        new AgentStatsReport(_log, _gameSession.CurrentGameState).Write();
        new TurnStatsReport(_log, _csvFile, gameStates).Write();
    }
}