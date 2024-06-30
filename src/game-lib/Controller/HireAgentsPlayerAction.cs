using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class HireAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly AgentIdGen _agentIdGen;
    private readonly int _count;

    public HireAgentsPlayerAction(ILog log, AgentIdGen agentIdGen, int count)
    {
        Contract.Assert(count >= 1);
        _log = log;
        _agentIdGen = agentIdGen;
        _count = count;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        _log.Info($"Hire agents. Count: {_count}");
        int totalHireCost = Ruleset.AgentsRuleset.AgentHireCost * _count;
        Contract.Assert(state.Assets.Money >= totalHireCost);
        state.Assets.Money -= totalHireCost;
        for (int i = 0; i < _count; i++)
        {
            state.Assets.Agents.Add(new Agent(_agentIdGen.Generate, state.Timeline.CurrentTurn));
        }

        return (ids: [state.Assets.Agents.Count], targetId: _count);
    }
}