using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class RecallAgentPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agent _agent;

    public RecallAgentPlayerAction(ILog log, Agent agent)
    {
        _log = log;
        _agent = agent;
    }

    public override void Apply(GameState state)
    {
        _log.Info($"Recall agent. ID: {_agent.Id, 4}. Was in state: {_agent.CurrentState}.");
        _agent.Recall();
    }
}