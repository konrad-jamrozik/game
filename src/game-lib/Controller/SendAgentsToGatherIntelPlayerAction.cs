using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

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

    protected override PlayerActionEvent ApplyImpl(GameState state)
    {
        _agents.ForEach(agent =>
        {
            _log.Info($"Send {agent.LogString} to gather intel. Was in state: {agent.CurrentState}.");
            agent.GatherIntel();
        });

        return new PlayerActionEvent("Send agents to gath. intel", $"IDs: {_agents.IdsLogString}");
    }
}