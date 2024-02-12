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

    public void SackAgent(int id)
        => PlayerActions.Apply(new SackAgentsPlayerAction(
                _log,
                _gameState.Assets.Agents.Single(agent => agent.Id == id).ToAgents()),
            _gameState);

    public void SackAgents(Agents agents)
        => PlayerActions.Apply(
            new SackAgentsPlayerAction(
                _log,
                agents),
            _gameState);

    public void SendAgentsToTraining(Agents agents)
        => PlayerActions.Apply(new SendAgentsToTrainingPlayerAction(_log, agents), _gameState);

    public void SendAgentsToGenerateIncome(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGenerateIncomePlayerAction(_log, agents), _gameState);

    public void SendAgentsToGatherIntel(Agents agents)
        => PlayerActions.Apply(new SendAgentsToGatherIntelPlayerAction(_log, agents), _gameState);

    public void RecallAgents(Agents agents)
        => PlayerActions.Apply(new RecallAgentsPlayerAction(_log, agents), _gameState);

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

        Debug.Assert(agents.Count == agentCount);

        LaunchMission(site, agents);
    }

    public void LaunchMission(MissionSite site, Agents agents)
        => PlayerActions.Apply(new LaunchMissionPlayerAction(_log, site, agents), _gameState);
}