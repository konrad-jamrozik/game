using Lib.Data;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class MissionSiteStatsReport : CsvFileReport
{
    private readonly ILog _log;
    private readonly GameState _gameState;
    private readonly File _csvFile;

    public MissionSiteStatsReport(ILog log, GameState gameState, File csvFile)
    {
        _log = log;
        _gameState = gameState;
        _csvFile = csvFile;
    }

    public void Write()
    {
        // kja2 MissionSiteStatsReport
        // Includes: most bloody mission
        // Top 5 hardest missions
        // Top 5 won hardest mission
        // Top 5 missions by terminated agents
        // Top 5 won missions by terminated agents
        // Top 5 missions with least amount of agents lost
        // Top 5 lost missions with least amount of agents lost
        
        object[] headerRow = HeaderRow;
        
        object[][] dataRows = DataRows(_gameState);
        
        Debug.Assert(!dataRows.Any() || headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(_log, "mission site", new TabularData(headerRow, dataRows), _csvFile);
    }

    private static object[] HeaderRow => new object[]
    {
        "SiteID", "Difficulty", "T. appeared", "T. deact.", "Expired", "MissionID", "Successful"
    };

    private static object[][] DataRows(GameState gameState)
    {
        return gameState.MissionSites.OrderBy(site => site.Id).Select(
            site =>
            {
                Mission ? mission = gameState.Missions.SingleOrDefault(mission => mission.Site == site);
                Debug.Assert(mission == null || mission.WasLaunched);
                
                object[] siteData = 
                {
                    site.Id,
                    site.Difficulty,
                    site.TurnAppeared,
                    site.TurnDeactivated!,
                    site.Expired
                };

                object[] missionData = mission != null
                    ? new object[]
                    {
                        mission.Id,
                        mission.IsSuccessful ? 1 : 0,

                    }
                    : new object[]
                    {
                        null!, null!
                    };

                return siteData.Concat(missionData).ToArray();

            }).ToArray();
    }
}