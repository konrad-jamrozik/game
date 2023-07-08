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
    private const int MaxAgentsToSendOnMission = 2;

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
        // kja2 the CurrentTransportCapacity should no longer be used as a limiting factor in this formulas,
        // as newly hired agents are in transit anyway.
        //
        // If there are less than MaxAgentsToSendOnMission then hire enough agents to reach MaxAgentsToSendOnMission.
        // However, hire no more than  CurrentTransportCapacity.

        int maxCountOfAgentsToSend = MaxCountOfAgentsToSend(state);
        int agentsNeededToReachMaxAgentsCountToSend = maxCountOfAgentsToSend - state.Assets.Agents.Count;
        int agentsToHire = Math.Max(agentsNeededToReachMaxAgentsCountToSend, 0);
        return agentsToHire;
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive)
           && state.Assets.CurrentTransportCapacity > 0
           && state.Assets.Agents.Any(agent => agent.CanBeSentOnMission);

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static List<Agent> ChooseAgents(GameStatePlayerView state)
    {
        int maxCountOfAgentsToSend = MaxCountOfAgentsToSend(state);
        List<Agent> agents = state.Assets.Agents
            .Where(agent => agent.CanBeSentOnMission)
            .Take(maxCountOfAgentsToSend)
            .ToList();
        Debug.Assert(agents.Any());
        return agents;
    }

    private static int MaxCountOfAgentsToSend(GameStatePlayerView state)
        => Math.Min(state.Assets.CurrentTransportCapacity, MaxAgentsToSendOnMission);
}