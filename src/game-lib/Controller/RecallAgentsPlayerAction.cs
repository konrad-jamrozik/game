using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class RecallAgentsPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Agents _agents;

    public RecallAgentsPlayerAction(ILog log, Agents agents)
    {
        _log = log;
        _agents = agents;
    }

    protected override PlayerActionEvent ApplyImpl(GameState state)
    {
        _agents.ForEach(agent =>
        {
            _log.Info($"Recall {agent.LogString}. Was in state: {agent.CurrentState}.");
            agent.Recall();
        });

        return new PlayerActionEvent("Recall agents", $"IDs: {_agents.IdsLogString}");
    }
}