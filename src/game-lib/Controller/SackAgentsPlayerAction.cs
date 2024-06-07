using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

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

    protected override string ApplyImpl(GameState state)
    {
        _log.Info($"Sack agents. Count: {_agents.Count}");
        foreach (Agent agent in _agents)
        {
            state.Terminate(agent, sack: true);
            _log.Info($"Sacked {agent.LogString}.");
        }

        return $"Count: {_agents.Count}, IDs: {_agents.IdsLogString}";
    }
}