using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

/// <summary>
/// Allows the IPlayer to invoke player actions on current game state turn view.
/// Notably, does not allow to invoke "advance time" player action, for reasons explained
/// in the comment of AdvanceTimePlayerAction.
/// </summary>
public class GameTurnController
{
    private readonly ILog _log;
    public IRandomGen RandomGen { get; }
    private readonly EventIdGen _eventIdGen;
    private readonly AgentIdGen _agentIdGen;
    private readonly MissionIdGen _missionIdGen;
    private readonly Func<GameState> _gameState;
    private GameState GameState => _gameState();
    private readonly List<PlayerActionEvent> _recordedPlayerActionEvents = [];

    public GameTurnController(
        ILog log,
        IRandomGen randomGen,
        EventIdGen eventIdGen,
        AgentIdGen agentIdGen,
        MissionIdGen missionIdGen,
        Func<GameState> gameState)
    {
        _log = log;
        RandomGen = randomGen;
        _eventIdGen = eventIdGen;
        _agentIdGen = agentIdGen;
        _missionIdGen = missionIdGen;
        _gameState = gameState;
    }


    public int CurrentTurn => GameState.Timeline.CurrentTurn;

    public PlayerActionEvent InvestIntel(int factionId, int intel)
        => InvestIntel(GetFactionById(factionId), intel);

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
        Agents agents = GameState.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(agentCount)
            .ToAgents();

        Contract.Assert(agents.Count == agentCount);

        LaunchMission(site, agents);
    }

    public PlayerActionEvent InvestIntel(Faction faction, int intel)
        => ExecuteAndRecordAction(new InvestIntelPlayerAction(_log, faction, intel));

    public PlayerActionEvent HireAgents(int count)
        => ExecuteAndRecordAction(new HireAgentsPlayerAction(_log, _agentIdGen, count));

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
        => ExecuteAndRecordAction(new LaunchMissionPlayerAction(_log, _missionIdGen, site, agents));

    public List<PlayerActionEvent> GetAndDeleteRecordedPlayerActionEvents()
    {
        List<PlayerActionEvent> returned = _recordedPlayerActionEvents.ToList();
        _recordedPlayerActionEvents.Clear();
        return returned;
    }

    private MissionSite GetMissionSiteById(int siteId) =>
        GameState.MissionSites.Single(site => site.Id == siteId);

    private Faction GetFactionById(int factionId) =>
        GameState.Factions.GetById(factionId);

    private Agents GetAgentsByIds(int[] agentsIds) =>
        GameState.Assets.Agents.GetByIds(agentsIds);

    private PlayerActionEvent ExecuteAndRecordAction(PlayerAction action)
    {
        // This assertion is here to prevent the player from doing anything if they caused the game to be over.
        Contract.Assert(!GameState.IsGameOver);
        PlayerActionEvent playerActionEvent = action.Apply(GameState, _eventIdGen.Generate);
        _recordedPlayerActionEvents.Add(playerActionEvent);
        return playerActionEvent;
    }
}