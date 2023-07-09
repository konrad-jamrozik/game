using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToGenerateIncomePlayerAction : PlayerAction
{
    private readonly Agent _agent;

    public SendAgentToGenerateIncomePlayerAction(Agent agent)
    {
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        Console.Out.WriteLine($"PlayerAction: Send agent to generate income. ID: {_agent.Id}");
        _agent.GenerateIncome();
    }
}