using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

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
            _log.Info($"Send {agent.LogString} to generate income. Was in state: {agent.CurrentState}.");
            agent.GenerateIncome();
        });
    }
}
