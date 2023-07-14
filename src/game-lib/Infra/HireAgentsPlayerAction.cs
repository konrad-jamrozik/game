using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class HireAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;


    public HireAgentsPlayerAction(ILog log, int count)
    {
        _log = log;
        Count = count;
    }

    public int Count { get; } // kja to private field?

    public override void Apply(GameState state)
    {
        _log.Info($"PlayerAction: Hire agents. Count: {Count}");
        for (int i = 0; i < Count; i++)
            state.Assets.Agents.Add(new Agent(state.NextAgentId));
    }
}