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
        object[] headerRow = HeaderRow;
        
        object[][] dataRows = DataRows(_gameState);
        
        Debug.Assert(!dataRows.Any() || headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(_log, "mission site", new TabularData(headerRow, dataRows), _csvFile);
    }

    private static object[] HeaderRow => new object[]
    {
        "SiteID", "MissionID", "Difficulty", "Turn appeared", "Turn deactivated", "Outcome",
        "Agents sent", "Agents required", "Agents survived", "Agents terminated", "Survival ratio", 
        "Expired", "Successful"
    };

    private static object[][] DataRows(GameState gameState)
    {
        return gameState.MissionSites.OrderBy(site => site.Id).Select(
            site =>
            {
                Mission ? mission = gameState.Missions.SingleOrDefault(mission => mission.Site == site);
                Debug.Assert(mission == null || mission.WasLaunched);

                int outcome = mission is { IsSuccessful: true } ? 1 : 0;
                double? survivalRatio = mission != null
                    ? Math.Round((double)mission.AgentsSurvived! / mission.AgentsSent, 2)
                    : null;
                
                object[] data =
                {
                    site.Id,
                    mission?.Id ?? null!,
                    site.Difficulty,
                    site.TurnAppeared,
                    site.TurnDeactivated!,
                    outcome,
                    mission?.AgentsSent ?? null!,
                    site.RequiredSurvivingAgentsForSuccess,
                    mission?.AgentsSurvived! ?? null!,
                    mission?.AgentsTerminated! ?? null!,
                    survivalRatio!,
                    site.Expired ? 1 : 0,
                    mission != null ? (mission.IsSuccessful ? 1 : 0) : null!,
                };

                return data.ToArray();

            }).ToArray();
    }
}