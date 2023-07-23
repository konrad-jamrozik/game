using Lib.Data;
using UfoGameLib.Lib;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class MissionStatsReport : CsvFileReport
{
    private readonly ILog _log;
    private readonly GameState _gameState;
    private readonly File _csvFile;

    public MissionStatsReport(ILog log, GameState gameState, File csvFile)
    {
        _log = log;
        _gameState = gameState;
        _csvFile = csvFile;
    }

    public void Write()
    {
        // kja LogMissionStats
        // Includes: most bloody mission
        // Top 5 hardest missions
        // Top 5 won hardest mission
        // Top 5 missions by terminated agents
        // Top 5 won missions by terminated agents
        // Top 5 missions with least amount of agents lost
        // Top 5 lost missions with least amount of agents lost
        SaveToCsvFile(_log, "mission", new TabularData(new object[] {}, new object[][] {}), _csvFile);
    }
}