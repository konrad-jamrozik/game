using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

/// <summary>
/// "Launch missions" AI player intellect capabilities:
///
/// - Advance time until mission is available
/// - Once mission available, hire agents up to transport limit and send on the first available mission
/// - Repeat until player loses game.
///
/// This intellect cannot win the game. Loss will most likely happen
/// due to running out of money.
///
/// </summary>
public class LaunchMissionsAIPlayerIntellect : IAIPlayerIntellect
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        int agentsToHire = ComputeAgentsToHire(state);
        if (agentsToHire > 0)
            controller.HireAgents(agentsToHire);

        while (CanLaunchSomeMission(state))
        {
            MissionSite site = ChooseMissionSite(state);
            List<Agent> agents = ChooseAgents(state);

            controller.LaunchMission(site, agents);
        }
    }

    private static int ComputeAgentsToHire(GameStatePlayerView state)
    {
        // Strive to always have twice as many agents as transport capacity,
        // to keep adequate reserves for defense and buffer for recovery.
        int maxAgentsToHave = state.Assets.MaxTransportCapacity * 2;
        int agentsMissingToMax = maxAgentsToHave - state.Assets.Agents.Count;

        return agentsMissingToMax;
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive)
           && state.Assets.CurrentTransportCapacity > 0
           && state.Assets.Agents.Any(agent => agent.CanBeSentOnMission);

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static List<Agent> ChooseAgents(GameStatePlayerView state)
    {
        List<Agent> agents = state.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(state.Assets.CurrentTransportCapacity)
            .ToList();

        Debug.Assert(agents.Any());

        return agents;
    }
}