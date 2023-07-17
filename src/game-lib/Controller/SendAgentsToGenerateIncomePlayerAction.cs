using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib.Controller;

public class SendAgentsToGenerateIncomePlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agents _agents;

    public SendAgentsToGenerateIncomePlayerAction(ILog log, Agents agents)
    {
        _log = log;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        _agents.ForEach(agent =>
        {
            _log.Info($"Send agent to generate income. ID: {agent.Id, 4}. Was in state: {agent.CurrentState}.");
            agent.GenerateIncome();
        });
    }
}
