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
        _log = log;
        _count = count;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"Hire agents. Count: {_count}");
        for (int i = 0; i < _count; i++)
            state.Assets.Agents.Add(new Agent(state.NextAgentId));
    }
}