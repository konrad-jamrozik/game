using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class HireAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly int _count;

    public HireAgentsPlayerAction(ILog log, int count)
    {
        Contract.Assert(count >= 1);
        _log = log;
        _count = count;
        
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        _log.Info($"Hire agents. Count: {_count}");
        int totalHireCost = Ruleset.AgentHireCost * _count;
        Contract.Assert(state.Assets.Money >= totalHireCost);
        state.Assets.Money -= totalHireCost;
        for (int i = 0; i < _count; i++)
        {
            state.Assets.Agents.Add(new Agent(state.NextAgentId, state.Timeline.CurrentTurn));
        }

        return (ids: [state.Assets.Agents.Count], targetId: _count);
    }
}