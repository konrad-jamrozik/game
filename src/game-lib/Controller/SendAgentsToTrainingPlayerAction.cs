using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

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
            _log.Info($"Send {agent.LogString} to training. Was in state: {agent.CurrentState}.");
            agent.SendToTraining();
        });
    }
}