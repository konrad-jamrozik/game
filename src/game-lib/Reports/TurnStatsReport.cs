using Lib.Data;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class TurnStatsReport : CsvFileReport
{
    private readonly ILog _log;
    private readonly List<GameState> _gameStates;
    private readonly File _csvFile;

    public TurnStatsReport(ILog log, List<GameState> gameStates, File csvFile)
    {
        _log = log;
        _gameStates = gameStates;
        _csvFile = csvFile;
    }

    public void Write()
    {
        object[] headerRow = HeaderRow;

        object[][] dataRows = DataRows(_gameStates);

        Debug.Assert(headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(_log, dataDescription: "turns", new TabularData(headerRow, dataRows), _csvFile);
    }

    private static object[] HeaderRow => new object[]
    {
        "Turn", "Money", "Intel", "Funding", "Upkeep cost", "Support", "Transport cap.",
        "Agents", "In training", "Generating income", "Gathering intel", "Recovering", "Terminated agents",
        "Launched missions", "Successful missions", "Failed missions", "Expired mission sites", "Avg diff. last 5",
        "Ag 100pc Skill", "Ag 80pc Skill", "Ag 60pc Skill", "Ag 40pc Skill", "Ag 20pc Skill",
        "Ag 100pc SurvLast", "Ag 80pc SurvLast", "Ag 60pc SurvLast", "Ag 40pc SurvLast", "Ag 20pc SurvLast"
    };

    private static object[][] DataRows(List<GameState> gameStates)
    {
        object[][] dataRows = gameStates
            // We are selecting every second state, because these are the states at the end of turn,
            // after player made their actions *AND* the turn time advanced.
            .Where((_, i) => (i % 2 == 0))
            .Select(
                state =>
                {
                    int lastMissionSiteDifficulty =
                        state.MissionSites.Any() ? state.MissionSites.TakeLast(1).Single().Difficulty : 0;

                    Agents agents = state.Assets.Agents;

                    double avgDiffLast5MissionSites = state.MissionSites.Any()
                        ? Math.Round(state.MissionSites.TakeLast(5).Average(site => site.Difficulty))
                        : 0;

                    object[] stateData =
                    {
                        state.Timeline.CurrentTurn,
                        state.Assets.Money / 10,
                        state.Assets.Intel,
                        state.Assets.Funding,
                        agents.UpkeepCost,
                        state.Assets.Support,
                        state.Assets.MaxTransportCapacity,
                        agents.Count,
                        agents.InTraining.Count,
                        agents.GeneratingIncome.Count,
                        agents.GatheringIntel.Count,
                        agents.Recovering.Count,
                        state.TerminatedAgents.Count,
                        state.Missions.Launched.Count,
                        state.Missions.Successful.Count,
                        state.Missions.Failed.Count,
                        state.MissionSites.Expired.Count,
                        avgDiffLast5MissionSites,
                        PropertyOfAgentAtPercentile(agents, ag => ag.SurvivalSkill, 100),
                        PropertyOfAgentAtPercentile(agents, ag => ag.SurvivalSkill, 80),
                        PropertyOfAgentAtPercentile(agents, ag => ag.SurvivalSkill, 60),
                        PropertyOfAgentAtPercentile(agents, ag => ag.SurvivalSkill, 40),
                        PropertyOfAgentAtPercentile(agents, ag => ag.SurvivalSkill, 20),
                        SurvivalChanceOfAgentAtPercentile(agents, lastMissionSiteDifficulty, 100),
                        SurvivalChanceOfAgentAtPercentile(agents, lastMissionSiteDifficulty, 80),
                        SurvivalChanceOfAgentAtPercentile(agents, lastMissionSiteDifficulty, 60),
                        SurvivalChanceOfAgentAtPercentile(agents, lastMissionSiteDifficulty, 40),
                        SurvivalChanceOfAgentAtPercentile(agents, lastMissionSiteDifficulty, 20),
                    };
                    return stateData;
                }).ToArray();
        return dataRows;
    }

    private static int PropertyOfAgentAtPercentile(Agents agents, Func<Agent, int> property, int percentile)
        => agents.Any()
            ? property(agents.AgentAtPercentile(percentile, agent => agent.SurvivalSkill))
            : 0;

    private static int SurvivalChanceOfAgentAtPercentile(Agents agents, int difficulty, int percentile)
        => agents.Any()
            ? agents.AgentAtPercentile(percentile, agent => agent.SurvivalSkill).SurvivalChance(difficulty)
            : 0;
}