using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class RecallAgentPlayerAction : PlayerAction
{
    private readonly Agent _agent;

    public RecallAgentPlayerAction(Agent agent)
    {
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        Console.Out.WriteLine($"PlayerAction: Recall agent. ID: {_agent.Id}");
        _agent.Recall();
    }
}