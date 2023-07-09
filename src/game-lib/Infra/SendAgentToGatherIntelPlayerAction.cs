using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToGatherIntelPlayerAction : PlayerAction
{
    private readonly Agent _agent;

    public SendAgentToGatherIntelPlayerAction(Agent agent)
    {
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        Console.Out.WriteLine($"PlayerAction: Send agent to gather intel. ID: {_agent.Id}");
        _agent.GatherIntel();
    }
}