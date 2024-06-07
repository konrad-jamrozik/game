using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class GameSessionStatsReportDeprecated
{
    private readonly ILog _log;
    private readonly GameSessionDeprecated _gameSession;
    private readonly File _turnReportCsvFile;
    private readonly File _agentReportCsvFile;
    private readonly File _missionSiteReportCsvFile;
    private readonly int _lastTurn;


    public GameSessionStatsReportDeprecated(
        ILog log,
        GameSessionDeprecated gameSession,
        File turnReportCsvFile,
        File agentReportCsvFile,
        File missionSiteReportCsvFile,
        int lastTurn)
    {
        _log = log;
        _gameSession = gameSession;
        _turnReportCsvFile = turnReportCsvFile;
        _agentReportCsvFile = agentReportCsvFile;
        _missionSiteReportCsvFile = missionSiteReportCsvFile;
        _lastTurn = lastTurn;
    }

    public void Write()
    {
        List<GameState> gameStates = _gameSession.AllGameStates.ToList();

        new TurnStatsReport(_log, gameStates, _turnReportCsvFile).Write();
        new AgentStatsReport(_log, _gameSession.CurrentGameState, _agentReportCsvFile, _lastTurn).Write();
        new MissionSiteStatsReport(_log, _gameSession.CurrentGameState, _missionSiteReportCsvFile).Write();
    }
}