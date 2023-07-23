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

        // kja LogMissionStats
        // Includes: most bloody mission
        // Top 5 hardest missions
        // Top 5 won hardest mission
        // Top 5 missions by terminated agents
        // Top 5 won missions by terminated agents
        // Top 5 missions with least amount of agents lost
        // Top 5 lost missions with least amount of agents lost

        new TurnStatsReport(_log, _csvFile, gameStates).Write();
    }


    // kja introduce class: AgentsStats
    private void LogAgentsStats(List<GameState> gameStates)
    {
        int lastTurn = _gameSession.CurrentGameState.Timeline.CurrentTurn - 1;

        Agents agentsWithMostSkill = AgentsWithMostSkill(gameStates, TopAgents);
        Agents agentsSurvivingLongest = AgentsSurvivingLongest(gameStates, TopAgents, lastTurn);
        Agents agentsOnMostMissions = AgentsOnMostMissions(gameStates, TopAgents);
        Agents agentsMostTrained = AgentsMostTrained(gameStates, TopAgents);
        Agents agentsOnMostIncomeGeneratingOps = AgentsOnMostIncomeGeneratingOps(gameStates, TopAgents);
        Agents agentsOnMostIntelGatheringOps = AgentsOnMostIntelGatheringOps(gameStates, TopAgents);
        Agents agentsMostInRecovery = AgentsMostInRecovery(gameStates, TopAgents);

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
    private Agents AgentsWithMostSkill(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(Ruleset.AgentSurvivalSkill)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsSurvivingLongest(List<GameState> gameStates, int top, int lastTurn)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => TurnsSurvived(agent, lastTurn))
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostMissions(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => agent.MissionsLaunched)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsMostTrained(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => agent.TurnsInTraining)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostIncomeGeneratingOps(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => agent.TurnsGeneratingIncome)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsOnMostIntelGatheringOps(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => agent.TurnsGatheringIntel)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    private Agents AgentsMostInRecovery(List<GameState> gameStates, int top)
        => gameStates.Last().AllAgents
            .OrderByDescending(agent => agent.TurnsInRecovery)
            .ThenBy(agent => agent.Id)
            .Take(top)
            .ToAgents(terminated: null);

    
}