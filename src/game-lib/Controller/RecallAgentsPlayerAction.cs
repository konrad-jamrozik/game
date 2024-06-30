using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class RecallAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agents _agents;

    public RecallAgentsPlayerAction(ILog log, Agents agents)
    {
        // kja2-assert: agents.AssertCanBeRecalled()
        Contract.Assert(agents.Any());
        _log = log;
        _agents = agents;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        _agents.ForEach(
            agent =>
            {
                _log.Debug($"Recall {agent.LogString}. Was in state: {agent.CurrentState}.");
                agent.Recall();
            });

        return (_agents.Ids, targetId: null);
    }
}
