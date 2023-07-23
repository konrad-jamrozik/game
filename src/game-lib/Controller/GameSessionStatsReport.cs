using Lib.Data;
using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Controller;

public class GameSessionStatsReport
{
    private const int TopAgents = 5;
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

        LogAgentsStats(gameStates);

        // kja introduce class: TurnStats
        object[] headerRow = HeaderRow;

        object[][] dataRows = DataRows(gameStates);

        Debug.Assert(headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(new TabularData(headerRow, dataRows));
    }

    // kja introduce class: AgentsStats
    private void LogAgentsStats(List<GameState> gameStates)
    {
        Agents mostSkilledAgents = MostSkilledAgents(gameStates, TopAgents);
        Agents longestSurvivingAgents = LongestSurvivingAgents(gameStates);
        Agents agentsSurvivingMostMissions = AgentsSurvivingMostMissions(gameStates);

        int lastTurn = _gameSession.CurrentGameState.Timeline.CurrentTurn - 1;

        _log.Info("");
        _log.Info($"Top {TopAgents} most skilled agents:");
        LogAgents(mostSkilledAgents, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} longest surviving agents:");
        LogAgents(longestSurvivingAgents, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents surviving most missions:");
        LogAgents(agentsSurvivingMostMissions, lastTurn);
        _log.Info("");
    }

    private void LogAgents(Agents agents, int lastTurn)
        => agents.ForEach(agent => _log.Info(AgentLogString(agent, lastTurn)));

    private static string AgentLogString(Agent agent, int lastTurn)
    {
        int agentEndTurn = agent.TurnTerminated ?? lastTurn;
        int turnsSurvived = agentEndTurn - agent.TurnHired;
        Debug.Assert(turnsSurvived >= 0);

        return $"{agent.LogString}" +
               $", Skill: {Ruleset.AgentSurvivalSkill(agent),3}" +
               $", Terminated: {agent.IsTerminated,5}" +
               $", TurnHired: {agent.TurnHired,3}" +
               $", TurnTerminated: {agent.TurnTerminated,3}" +
               $", TurnsSurvived: {turnsSurvived,3}" +
               $", MissionsLaunched: ?" +
               $", MissionsSuccessful: ?" +
               $", MissionsFailed: ?" +
               $", DaysInTraining: ?" +
               $", DaysGeneratingIncome: ?" +
               $", DaysGatheringIntel: ?" +
               $", DaysRecovering: ?";
    }

    private Agents MostSkilledAgents(List<GameState> gameStates, int top)
    {
        return gameStates.Last().AllAgents
            .OrderByDescending(Ruleset.AgentSurvivalSkill)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);
    }

    private Agents LongestSurvivingAgents(List<GameState> gameStates)
    {
        return new Agents();
    }

    private Agents AgentsSurvivingMostMissions(List<GameState> gameStates)
    {
        return new Agents();
    }

    private static object[] HeaderRow => new object[]
    {
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