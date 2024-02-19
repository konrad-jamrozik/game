using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class GameTurnController
{
    private readonly ILog _log;
    private readonly GameState _gameState;

    public GameTurnController(ILog log, RandomGen randomGen, GameState gameState)
    {
        _log = log;
        RandomGen = randomGen;
        _gameState = gameState;
    }

    public RandomGen RandomGen { get; }

    public void HireAgents(int count)
        => PlayerActions.Apply(new HireAgentsPlayerAction(_log, count), _gameState);

    public void BuyTransportCapacity(int capacity)
        => PlayerActions.Apply(new BuyTransportCapacityPlayerAction(_log, capacity), _gameState);

    public void SackAgents(Agents agents)
        => PlayerActions.Apply(new SackAgentsPlayerAction(_log, agents), _gameState);

    public void SackAgents(int[] agentsIds) => SackAgents(GetAgentsByIds(agentsIds));

    public void SendAgentsToTraining(Agents agents)
        => PlayerActions.Apply(new SendAgentsToTrainingPlayerAction(_log, agents), _gameState);

    public void SendAgentsToTraining(int[] agentsIds)
        => SendAgentsToTraining(GetAgentsByIds(agentsIds));

    public void SendAgentsToGenerateIncome(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGenerateIncomePlayerAction(_log, agents), _gameState);

    public void SendAgentsToGenerateIncome(int[] agentsIds)
        => SendAgentsToGenerateIncome(GetAgentsByIds(agentsIds));

    public void SendAgentsToGatherIntel(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGatherIntelPlayerAction(_log, agents), _gameState);

    public void SendAgentsToGatherIntel(int[] agentsIds)
        => SendAgentsToGatherIntel(GetAgentsByIds(agentsIds));

    public void RecallAgents(Agents agents)
        => PlayerActions.Apply(new RecallAgentsPlayerAction(_log, agents), _gameState);

    public void RecallAgents(int[] agentsIds)
        => RecallAgents(GetAgentsByIds(agentsIds));

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

    public void LaunchMission(MissionSite site, Agents agents)
        => PlayerActions.Apply(new LaunchMissionPlayerAction(_log, site, agents), _gameState);

    public void LaunchMission(int siteId, int[] agentsIds)
        => LaunchMission(GetMissionSiteById(siteId), GetAgentsByIds(agentsIds));

    private MissionSite GetMissionSiteById(int siteId) =>
        _gameState.MissionSites.Single(site => site.Id == siteId);

    private Agents GetAgentsByIds(int[] agentsIds) =>
        _gameState.Assets.Agents.GetByIds(agentsIds);
}