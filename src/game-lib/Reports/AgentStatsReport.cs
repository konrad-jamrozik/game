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

        Agents agentsWithMostSkill = TopAgentsBy(Ruleset.AgentSurvivalSkill);
        Agents agentsSurvivingLongest = TopAgentsBy(agent => TurnsSurvived(agent, lastTurn));
        Agents agentsSurvivingMostMissions = TopAgentsBy(agent => agent.MissionsSurvived);
        Agents agentsMostTrained = TopAgentsBy(agent => agent.TurnsInTraining);
        Agents agentsOnMostIncomeGeneratingOps = TopAgentsBy(agent => agent.TurnsGeneratingIncome);
        Agents agentsOnMostIntelGatheringOps = TopAgentsBy(agent => agent.TurnsGatheringIntel);
        Agents agentsMostInRecovery = TopAgentsBy(agent => agent.TurnsInRecovery);

        // kja dedup this LogAgentsStats code
        _log.Info("");
        _log.Info($"Top {TopAgents} agents by skill:");
        LogAgents(agentsWithMostSkill, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns survived:");
        LogAgents(agentsSurvivingLongest, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by missions survived:");
        LogAgents(agentsSurvivingMostMissions, lastTurn);
        _log.Info("");

        _log.Info($"Top {TopAgents} agents by turns in training:");
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
               $" | Skill: {Ruleset.AgentSurvivalSkill(agent),3}" +
               $" | Terminated: {agent.IsTerminated,5}" +
               $" | T.Hired: {agent.TurnHired,3}" +
               $" | T.Term.: {agent.TurnTerminated,3}" +
               $" | TsSurvived: {turnsSurvived,3}" +
               $" | Mis.Survived: {agent.MissionsSurvived,3}" +
               $" | Mis.Succeeded: {agent.MissionsSucceeded,3}" +
               $" | Mis.Failed: {agent.MissionsFailed,3}" +
               $" | TsInTraining: {agent.TurnsInTraining,3}" +
               $" | TsGenIncome: {agent.TurnsGeneratingIncome,3}" +
               $" | TsGathIntel: {agent.TurnsGeneratingIncome,3}" +
               $" | TsInRecovery: {agent.TurnsInRecovery,3}";
    }

    private static int TurnsSurvived(Agent agent, int lastTurn)
    {
        int agentEndTurn = agent.TurnTerminated ?? lastTurn;
        int turnsSurvived = agentEndTurn - agent.TurnHired;
        return turnsSurvived;
    }

    private Agents TopAgentsBy(Func<Agent, int> orderBy)
        => _gameState.AllAgents
            .OrderByDescending(orderBy)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);
}