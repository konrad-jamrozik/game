using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

/// <summary>
/// Current AIPlayer capabilities:
///
/// - Advance time until mission is available
/// - Once mission available, hire agents up to transport limit and send on the first available mission
/// - Repeat until player loses game. At this point it impossible to win. Loss will most likely happend
/// due to running out of money.
///
/// kja2 improvements to AIPlayer:
/// - Try to always keep at least enough agents to maintain full transport capacity
/// - Send agents on intel-gathering duty until mission is available
/// - Send agents on available mission if not too hard
/// - Do not hire agents if it would lead to bankruptcy
/// </summary>
public class AIPlayer : AbstractAIPlayer
{
    private const int MaxAgentsToSendOnMission = 2;

    public AIPlayer(GameSessionController controller) : base(controller)
    {
    }

    protected override void PlayGameTurn(GameSessionController controller)
    {
        GameStatePlayerView gameStateView = controller.GameStatePlayerView;
            
        while (CanLaunchSomeMission(gameStateView))
        {
            MissionSite targetSite = ChooseMissionSite(gameStateView);
            HireAgentsIfNecessary(gameStateView, controller);
            controller.LaunchMission(targetSite, gameStateView.Assets.Agents.Count);
        }
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.Any(site => site.IsActive) && gameStateView.Assets.CurrentTransportCapacity > 0;

    private static MissionSite ChooseMissionSite(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.First(site => site.IsActive);

    private void HireAgentsIfNecessary(GameStatePlayerView gameStateView, GameSessionController controller)
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
