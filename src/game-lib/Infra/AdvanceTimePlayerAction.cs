using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class AdvanceTimePlayerAction : PlayerAction
{
    private static readonly Agent.State[] TransientAgentStates = {
        Agent.State.InTransit,
        Agent.State.OnMission,
    };

    public override void Apply(GameState state)
    {
        state.Timeline.CurrentTurn++;
        Console.Out.WriteLine($"Advance time into turn: {state.Timeline.CurrentTurn}");

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        // Agents cost upkeep.
        state.Assets.CurrentMoney -= state.Assets.Agents.Count * 5;

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

    private static void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            Console.Out.WriteLine($"Add MissionSite with Id: {siteId}");
            state.MissionSites.Add(new MissionSite(siteId, isActive: true));
        }
    }
}