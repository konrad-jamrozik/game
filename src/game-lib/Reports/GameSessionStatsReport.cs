using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class GameSessionStatsReport
{
    private readonly ILog _log;
    private readonly GameSession _gameSession;
    private readonly File _turnsReportCsvFile;
    private readonly File _agentsReportCsvFile;
    private readonly File _missionsReportCsvFile;


    public GameSessionStatsReport(
        ILog log,
        GameSession gameSession,
        File turnsReportCsvFile,
        File agentsReportCsvFile,
        File missionsReportCsvFile)
    {
        _log = log;
        _gameSession = gameSession;
        _turnsReportCsvFile = turnsReportCsvFile;
        _agentsReportCsvFile = agentsReportCsvFile;
        _missionsReportCsvFile = missionsReportCsvFile;
    }

    public void Write()
    {
        List<GameState> gameStates =
            _gameSession.PastGameStates.Concat(_gameSession.CurrentGameState.WrapInList()).ToList();

        new TurnStatsReport(_log, gameStates, _turnsReportCsvFile).Write();
        new AgentStatsReport(_log, _gameSession.CurrentGameState, _agentsReportCsvFile).Write();
        new MissionStatsReport(_log, _gameSession.CurrentGameState, _missionsReportCsvFile).Write();
    }
}