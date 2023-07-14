using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToGenerateIncomePlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agent _agent;

    public SendAgentToGenerateIncomePlayerAction(ILog log, Agent agent)
    {
        _log = log;
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"PlayerAction: Send agent to generate income. ID: {_agent.Id}");
        _agent.GenerateIncome();
    }
}