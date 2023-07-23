using Lib.Data;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Controller;

public class TurnStatsReport
{
    private readonly ILog _log;
    private readonly File _csvFile;
    private readonly List<GameState> _gameStates;

    public TurnStatsReport(ILog log, File csvFile, List<GameState> gameStates)
    {
        _log = log;
        _csvFile = csvFile;
        _gameStates = gameStates;
    }

    public void Write()
    {
        object[] headerRow = HeaderRow;

        object[][] dataRows = DataRows(_gameStates);

        Debug.Assert(headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(new TabularData(headerRow, dataRows));
    }

    private static object[] HeaderRow => new object[]
    {
        // kja need to add: money from generated income; median survival on last
        "Turn", "Money", "Intel", "Funding", "Upkeep cost", "Support", "Transport cap.",
        "Agents", "In training", "Generating income", "Gathering intel", "Recovering", "Terminated agents",
        "Launched missions", "Successful missions", "Failed missions", "Expired mission sites", "Avg diff. last 5",
        "Avg agent skill", "Max agent skill", "Max survival on last"
    };

    private static object[][] DataRows(List<GameState> gameStates)
    {
        int lastMissionSiteMaxAgentSurvivalChance;

        object[][] dataRows = gameStates
            // We are selecting every second state, because these are the states at the end of turn,
            // after player made their actions *AND* the turn time advanced.
            .Where((_, i) => (i % 2 == 0))
            .Select(
                state =>
                {
                    int lastMissionSiteDifficulty =
                        state.MissionSites.Any() ? state.MissionSites.TakeLast(1).Single().Difficulty : 0;

                    Agent? mostSkilledAgent = state.Assets.Agents.Any()
                        ? state.Assets.Agents.MaxBy(Ruleset.AgentSurvivalSkill)
                        : null;

                    double avgDiffLast5MissionSites = state.MissionSites.Any()
                        ? Math.Round(state.MissionSites.TakeLast(5).Average(site => site.Difficulty))
                        : 0;

                    double avgAgentSkill = state.Assets.Agents.Any()
                        ? Math.Round(state.Assets.Agents.Average(Ruleset.AgentSurvivalSkill), 2)
                        : 0;

                    int maxAgentSkill = mostSkilledAgent != null ? Ruleset.AgentSurvivalSkill(mostSkilledAgent) : 0;

                    lastMissionSiteMaxAgentSurvivalChance = mostSkilledAgent != null && lastMissionSiteDifficulty > 0
                        ? Math.Max(Ruleset.AgentSurvivalChance(mostSkilledAgent, lastMissionSiteDifficulty), 0)
                        : 0;

                    object[] stateData =
                    {
                        state.Timeline.CurrentTurn,
                        state.Assets.Money / 10,
                        state.Assets.Intel,
                        state.Assets.Funding,
                        state.Assets.Agents.UpkeepCost,
                        state.Assets.Support,
                        state.Assets.MaxTransportCapacity,
                        state.Assets.Agents.Count,
                        state.Assets.Agents.InTraining.Count,
                        state.Assets.Agents.GeneratingIncome.Count,
                        state.Assets.Agents.GatheringIntel.Count,
                        state.Assets.Agents.Recovering.Count,
                        state.TerminatedAgents.Count,
                        state.Missions.Launched.Count,
                        state.Missions.Successful.Count,
                        state.Missions.Failed.Count,
                        state.MissionSites.Expired.Count,
                        avgDiffLast5MissionSites,
                        avgAgentSkill,
                        maxAgentSkill,
                        lastMissionSiteMaxAgentSurvivalChance
                    };
                    return stateData;
                }).ToArray();
        return dataRows;
    }

    private void SaveToCsvFile(TabularData data)
    {
        new CsvFile(_csvFile, data).Write();
        _log.Info($"Saved game data .csv report to {_csvFile.FullPath}");
    }
}