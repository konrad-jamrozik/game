using Lib.Primitives;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

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

        new AgentStatsReport(_log, _gameSession.CurrentGameState).Write();
        new MissionStatsReport(_log, _gameSession.CurrentGameState).Write();
        new TurnStatsReport(_log, _csvFile, gameStates).Write();
    }
}