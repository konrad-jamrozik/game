using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

/// <summary>
/// "Only send agents on missions" AI player intellect capabilities:
///
/// - Advance time until mission is available
/// - Once mission available, hire agents up to transport limit and send on the first available mission
/// - Repeat until player loses game.
///
/// This intellect cannot win the game. Loss will most likely happen
/// due to running out of money.
///
/// </summary>
public class OnlySendAgentsOnMissionsAIPlayerIntellect : IAIPlayerIntellect
{
    private const int MaxAgentsToSendOnMission = 2;

    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        while (CanLaunchSomeMission(state))
        {
            MissionSite targetSite = ChooseMissionSite(state);
            HireAgentsIfNecessary(state, controller);
            controller.LaunchMission(targetSite, state.Assets.Agents.Count);
        }
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.Any(site => site.IsActive) && gameStateView.Assets.CurrentTransportCapacity > 0;

    private static MissionSite ChooseMissionSite(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.First(site => site.IsActive);

    private static void HireAgentsIfNecessary(GameStatePlayerView gameStateView, GameSessionController controller)
    {
        // If there are less than MaxAgentsToSendOnMission then hire enough agents to reach MaxAgentsToSendOnMission,
        // however, no more than remaining transport capacity, i.e. CurrentTransportCapacity.
        int agentsToHire = Math.Max(
            Math.Min(gameStateView.Assets.CurrentTransportCapacity, MaxAgentsToSendOnMission) -
            gameStateView.Assets.Agents.Count,
            0);

        controller.HireAgents(agentsToHire);
    }
}