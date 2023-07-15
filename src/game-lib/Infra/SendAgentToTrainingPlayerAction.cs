using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToTrainingPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agent _agent;

    public SendAgentToTrainingPlayerAction(ILog log, Agent agent)
    {
        _log = log;
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"Send agent to training. ID: {_agent.Id}");
        _agent.SendToTraining();
    }
}