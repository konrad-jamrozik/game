using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class SendAgentToGatherIntelPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agent _agent;

    public SendAgentToGatherIntelPlayerAction(ILog log, Agent agent)
    {
        _log = log;
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"Send agent to gather intel. ID: {_agent.Id}");
        _agent.GatherIntel();
    }
}