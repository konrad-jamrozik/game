using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib.Controller;

public class SackAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;

    private readonly Agents _agents;


    public SackAgentsPlayerAction(ILog log, Agents agents)
    {
        agents.AssertCanBeSacked();
        _log = log;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"Sack agents. Count: {_agents.Count}");
        foreach (Agent agent in _agents)
        {
            state.Terminate(agent, sack: true);
            _log.Info($"Agent with ID {agent.Id,4} sacked.");
        }
    }
}