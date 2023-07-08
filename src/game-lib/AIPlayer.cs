using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

/// <summary>
/// Current AIPlayer capabilities:
///
/// - Advance time until mission is available
/// - Once mission available, hire agents up to transport limit and send on the first available mission
/// - Repeat until player loses game. At this point it impossible to win. Loss will most likely happen
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
    private readonly Intellect _intellect;

    public enum Intellect
    {
        DoNothing,
        OnlySendAgentsOnMissions,
        Basic
    }

    private readonly IDictionary<Intellect, Action<GameStatePlayerView, GameSessionController>> _intellectMap =
        new Dictionary<Intellect, Action<GameStatePlayerView, GameSessionController>>
        {
            [Intellect.DoNothing] = PlayGameTurnWithDoNothingIntellect,
            [Intellect.OnlySendAgentsOnMissions] = PlayGameTurnWithOnlySendAgentsOnMissionsIntellect,
            [Intellect.Basic] = PlayGameTurnWithBasicIntellect
        };

    private const int MaxAgentsToSendOnMission = 2;

    public AIPlayer(GameSessionController controller, Intellect intellect) : base(controller)
    {
        _intellect = intellect;
    }

    protected override void PlayGameTurn(GameSessionController controller)
    {
        GameStatePlayerView gameStateView = controller.GameStatePlayerView;
        _intellectMap[_intellect](gameStateView, controller);
    }

    private static void PlayGameTurnWithDoNothingIntellect(
        GameStatePlayerView gameStateView,
        GameSessionController controller)
    {
        // Do nothing.
    }

    private static void PlayGameTurnWithOnlySendAgentsOnMissionsIntellect(
        GameStatePlayerView gameStateView,
        GameSessionController controller)
    {
        while (CanLaunchSomeMission(gameStateView))
        {
            MissionSite targetSite = ChooseMissionSite(gameStateView);
            HireAgentsIfNecessary(gameStateView, controller);
            controller.LaunchMission(targetSite, gameStateView.Assets.Agents.Count);
        }
    }

    private static void PlayGameTurnWithBasicIntellect(
        GameStatePlayerView gameStateView,
        GameSessionController controller)
    {
        // kja current work
        // Agents should be always occupied. Doing one of the following:
        // - being sent on a mission
        // - recovering from wounds
        // - training to improve
        // - gathering intelligence
        // - generating income
        //
        // The AIPlayer also needs to take into account the following:
        // - Are there any missions? Are they easy enough to send agents to?
        // - Is there enough money in the bank? Income/Expenses are OK?
        // - Are there enough agents available, or more need to be hired?
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
