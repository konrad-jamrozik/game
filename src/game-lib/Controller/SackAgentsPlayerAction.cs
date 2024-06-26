using Lib.Contracts;
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
        Contract.Assert(agents.Any());
        agents.AssertCanBeSacked();
        _log = log;
        _agents = agents;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        _log.Debug($"Sack agents. Count: {_agents.Count}");
        foreach (Agent agent in _agents)
        {
            state.Terminate(agent, sack: true);
            _log.Debug($"Sacked {agent.LogString}.");
        }

        return (_agents.Ids, targetId: null);
    }
}
