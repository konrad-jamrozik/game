using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Reports;

public class AgentStatsReport
{
    private const int TopAgents = 5;

    private readonly ILog _log;
    private readonly GameState _gameState;

    public AgentStatsReport(ILog log, GameState gameState)
    {
        _log = log;
        _gameState = gameState;
    }

    public void Write()
    {
        int lastTurn = _gameState.Timeline.CurrentTurn - 1;

        Agents agentsWithMostSkill = AgentsWithMostSkill();
        Agents agentsSurvivingLongest = AgentsSurvivingLongest(lastTurn);
        Agents agentsOnMostMissions = AgentsOnMostMissions();
        Agents agentsMostTrained = AgentsMostTrained();
        Agents agentsOnMostIncomeGeneratingOps = AgentsOnMostIncomeGeneratingOps();
        Agents agentsOnMostIntelGatheringOps = AgentsOnMostIntelGatheringOps();
        Agents agentsMostInRecovery = AgentsMostInRecovery();

        // kja dedup this LogAgentsStats code
        _log.Info("");
        _log.Info($"Top {TopAgents} agents by skill:");
        LogAgents(agentsWithMostSkill, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns survived:");
        LogAgents(agentsSurvivingLongest, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by missions launched:");
        LogAgents(agentsOnMostMissions, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns trained:");
        LogAgents(agentsMostTrained, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns generating income:");
        LogAgents(agentsOnMostIncomeGeneratingOps, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns gathering intel:");
        LogAgents(agentsOnMostIntelGatheringOps, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns in recovery:");
        LogAgents(agentsMostInRecovery, lastTurn);
        _log.Info("");
    }

    private void LogAgents(Agents agents, int lastTurn)
        => agents.ForEach(agent => _log.Info(AgentLogString(agent, lastTurn)));

    private static string AgentLogString(Agent agent, int lastTurn)
    {
        int turnsSurvived = TurnsSurvived(agent, lastTurn);
        Debug.Assert(turnsSurvived >= 0);

        return $"{agent.LogString}" +
               $", Skill: {Ruleset.AgentSurvivalSkill(agent),3}" +
               $", Terminated: {agent.IsTerminated,5}" +
               $", TurnHired: {agent.TurnHired,3}" +
               $", TurnTerminated: {agent.TurnTerminated,3}" +
               $", TurnsSurvived: {turnsSurvived,3}" +
               $", MissionsLaunched: {agent.MissionsLaunched,3}" +
               $", MissionsSucceeded: {agent.MissionsSucceeded,3}" +
               $", MissionsFailed: {agent.MissionsFailed,3}" +
               $", TurnsInTraining: {agent.TurnsInTraining,3}" +
               $", TurnsGeneratingIncome: {agent.TurnsGeneratingIncome,3}" +
               $", TurnsGatheringIntel: {agent.TurnsGeneratingIncome,3}" +
               $", TurnsInRecovery: {agent.TurnsInRecovery,3}";
    }

    private static int TurnsSurvived(Agent agent, int lastTurn)
    {
        int agentEndTurn = agent.TurnTerminated ?? lastTurn;
        int turnsSurvived = agentEndTurn - agent.TurnHired;
        return turnsSurvived;
    }

    // kja dedup these Agents .. Most methods
    private Agents AgentsWithMostSkill()
        => _gameState.AllAgents
            .OrderByDescending(Ruleset.AgentSurvivalSkill)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsSurvivingLongest(int lastTurn)
        => _gameState.AllAgents
            .OrderByDescending(agent => TurnsSurvived(agent, lastTurn))
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostMissions()
        => _gameState.AllAgents
            .OrderByDescending(agent => agent.MissionsLaunched)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsMostTrained()
        => _gameState.AllAgents
            .OrderByDescending(agent => agent.TurnsInTraining)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostIncomeGeneratingOps()
        => _gameState.AllAgents
            .OrderByDescending(agent => agent.TurnsGeneratingIncome)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostIntelGatheringOps()
        => _gameState.AllAgents
            .OrderByDescending(agent => agent.TurnsGatheringIntel)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private Agents AgentsMostInRecovery()
        => _gameState.AllAgents
            .OrderByDescending(agent => agent.TurnsInRecovery)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);
}