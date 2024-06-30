using Lib.Contracts;
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
        Contract.Assert(agents.Any());
        _log = log;
        _agents = agents;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        _agents.ForEach(
            agent =>
            {
                _log.Debug($"Send {agent.LogString} to training. Was in state: {agent.CurrentState}.");
                agent.SendToTraining();
            });

        return (_agents.Ids, targetId: null);
    }
}
