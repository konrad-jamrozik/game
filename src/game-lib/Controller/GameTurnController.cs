using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class GameTurnController
{
    private readonly ILog _log;
    private readonly GameState _gameState;
    private int _nextEventId;
    private readonly List<PlayerActionEvent> _recordedPlayerActionEvents = new();

    // kja nextEventId should be passed before gameState
    public GameTurnController(ILog log, RandomGen randomGen, GameState gameState, int nextEventId)
    {
        _log = log;
        RandomGen = randomGen;
        _gameState = gameState;
        _nextEventId = nextEventId;
    }

    public RandomGen RandomGen { get; }

    public int CurrentTurn => _gameState.Timeline.CurrentTurn;

    public PlayerActionEvent SackAgents(int[] agentsIds) => SackAgents(GetAgentsByIds(agentsIds));

    public PlayerActionEvent SendAgentsToTraining(int[] agentsIds)
        => SendAgentsToTraining(GetAgentsByIds(agentsIds));

    public PlayerActionEvent SendAgentsToGenerateIncome(int[] agentsIds)
        => SendAgentsToGenerateIncome(GetAgentsByIds(agentsIds));
    public PlayerActionEvent SendAgentsToGatherIntel(int[] agentsIds)
        => SendAgentsToGatherIntel(GetAgentsByIds(agentsIds));

    public PlayerActionEvent RecallAgents(int[] agentsIds)
        => RecallAgents(GetAgentsByIds(agentsIds));

    public PlayerActionEvent LaunchMission(int siteId, int[] agentsIds)
        => LaunchMission(GetMissionSiteById(siteId), GetAgentsByIds(agentsIds));

    /// <summary>
    /// Convenience method. LaunchMission, but instead of choosing specific agents,
    /// choose up to first agentCount agents that can be sent on a mission.
    /// </summary>
    public void LaunchMission(MissionSite site, int agentCount)
    {
        Agents agents = _gameState.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(agentCount)
            .ToAgents();

        Contract.Assert(agents.Count == agentCount);

        LaunchMission(site, agents);
    }

    public PlayerActionEvent HireAgents(int count)
        => ExecuteAndRecordAction(new HireAgentsPlayerAction(_log, count));

    public PlayerActionEvent BuyTransportCapacity(int capacity)
        => ExecuteAndRecordAction(new BuyTransportCapacityPlayerAction(_log, capacity));

    public PlayerActionEvent SackAgents(Agents agents)
        => ExecuteAndRecordAction(new SackAgentsPlayerAction(_log, agents));

    public PlayerActionEvent SendAgentsToTraining(Agents agents)
        => ExecuteAndRecordAction(new SendAgentsToTrainingPlayerAction(_log, agents));

    public PlayerActionEvent SendAgentsToGenerateIncome(Agents agents)
        => ExecuteAndRecordAction(new SendAgentsToGenerateIncomePlayerAction(_log, agents));

    public PlayerActionEvent SendAgentsToGatherIntel(Agents agents)
        => ExecuteAndRecordAction(new SendAgentsToGatherIntelPlayerAction(_log, agents));

    public PlayerActionEvent RecallAgents(Agents agents)
        => ExecuteAndRecordAction(new RecallAgentsPlayerAction(_log, agents));

    public PlayerActionEvent LaunchMission(MissionSite site, Agents agents)
        => ExecuteAndRecordAction(new LaunchMissionPlayerAction(_log, site, agents));

    public List<PlayerActionEvent> GetAndDeleteRecordedPlayerActionEvents()
    {
        List<PlayerActionEvent> returned = _recordedPlayerActionEvents.ToList();
        _recordedPlayerActionEvents.Clear();
        return returned;
    }

    private MissionSite GetMissionSiteById(int siteId) =>
        _gameState.MissionSites.Single(site => site.Id == siteId);

    private Agents GetAgentsByIds(int[] agentsIds) =>
        _gameState.Assets.Agents.GetByIds(agentsIds);

    private PlayerActionEvent ExecuteAndRecordAction(PlayerAction action)
    {
        // This assertion is here to prevent the player from doing anything if they caused the game to be over.
        Contract.Assert(!_gameState.IsGameOver);
        PlayerActionEvent playerActionEvent = action.Apply(_gameState, _nextEventId++);
        _recordedPlayerActionEvents.Add(playerActionEvent);
        return playerActionEvent;
    }
}