using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentsToTrainingPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agents _agents;

    public SendAgentsToTrainingPlayerAction(ILog log, Agents agents)
    {
        _log = log;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        _agents.ForEach(agent =>
        {
            _log.Info($"Send agent to training. ID: {agent.Id, 4}. Was in state: {agent.CurrentState}.");
            agent.SendToTraining();
        });
    }
}