using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Controller;

public class SendAgentsToGatherIntelPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agents _agents;

    public SendAgentsToGatherIntelPlayerAction(ILog log, Agents agents)
    {
        _log = log;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        _agents.ForEach(agent =>
        {
            _log.Info($"Send agent to gather intel. ID: {agent.Id, 4}. Was in state: {agent.CurrentState}.");
            agent.GatherIntel();
        });
    }
}