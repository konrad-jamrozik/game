using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class GameSessionStatsReport
{
    private readonly ILog _log;
    private readonly GameSession _gameSession;
    private readonly File _turnReportCsvFile;
    private readonly File _agentReportCsvFile;
    private readonly File _missionSiteReportCsvFile;


    public GameSessionStatsReport(
        ILog log,
        GameSession gameSession,
        File turnReportCsvFile,
        File agentReportCsvFile,
        File missionSiteReportCsvFile)
    {
        _log = log;
        _gameSession = gameSession;
        _turnReportCsvFile = turnReportCsvFile;
        _agentReportCsvFile = agentReportCsvFile;
        _missionSiteReportCsvFile = missionSiteReportCsvFile;
    }

    public void Write()
    {
        List<GameState> gameStates =
            _gameSession.PastGameStates.Concat(_gameSession.CurrentGameState.WrapInList()).ToList();

        new TurnStatsReport(_log, gameStates, _turnReportCsvFile).Write();
        new AgentStatsReport(_log, _gameSession.CurrentGameState, _agentReportCsvFile).Write();
        new MissionSiteStatsReport(_log, _gameSession.CurrentGameState, _missionSiteReportCsvFile).Write();
    }
}