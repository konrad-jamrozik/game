using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToTrainingPlayerAction : PlayerAction
{
    private readonly Agent _agent;

    public SendAgentToTrainingPlayerAction(Agent agent)
    {
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        Console.Out.WriteLine($"PlayerAction: Send agent to training. ID: {_agent.Id}");
        _agent.SendToTraining();
    }
}
