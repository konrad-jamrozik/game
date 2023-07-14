using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class AdvanceTimePlayerAction : PlayerAction
{
    private static readonly Agent.State[] TransientAgentStates =
    {
        Agent.State.InTransit,
        Agent.State.OnMission,
    };

    private readonly ILog _log;

    public AdvanceTimePlayerAction(ILog log)
    {
        _log = log;
    }

    public override void Apply(GameState state)
    {
        state.Timeline.CurrentTurn++;
        _log.Info($"PlayerAction: Advance time into turn: {state.Timeline.CurrentTurn}");

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        // Agents cost upkeep.
        state.Assets.CurrentMoney -= state.Assets.Agents.Count * Agent.UpkeepCost;

        UpdateAgentStates(state);

        CreateMissionSites(state);
    }

    private static void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.ForEach(
            agent =>
            {
                if (TransientAgentStates.Contains(agent.CurrentState))
                {
                    agent.CurrentState = Agent.State.Available;
                }
            });
    }

    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            _log.Info($"Add MissionSite with Id: {siteId}");
            state.MissionSites.Add(new MissionSite(siteId, isActive: true));
        }
    }
}