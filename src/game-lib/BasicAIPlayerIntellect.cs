using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

public class BasicAIPlayerIntellect : IAIPlayerIntellect
{
    private const int MaxAgentsToSendOnMission = 2;

    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        // kja curr work PlayGameTurnWithBasicIntellect: see also note at file bottom.
        while (CanLaunchSomeMission(state))
        {
            MissionSite targetSite = ChooseMissionSite(state);
            HireAgentsIfNecessary(state, controller);
            controller.LaunchMission(targetSite, state.Assets.Agents.Count);
        }
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive) && state.Assets.CurrentTransportCapacity > 0;

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static void HireAgentsIfNecessary(GameStatePlayerView state, GameSessionController controller)
    {
        // If there are less than MaxAgentsToSendOnMission then hire enough agents to reach MaxAgentsToSendOnMission,
        // however, no more than remaining transport capacity, i.e. CurrentTransportCapacity.

        int maxCountOfAgentsToSend = Math.Min(state.Assets.CurrentTransportCapacity, MaxAgentsToSendOnMission);
        int agentsNeededToReachMaxAgentsCountToSend = maxCountOfAgentsToSend - state.Assets.Agents.Count;
        int agentsToHire = Math.Max(agentsNeededToReachMaxAgentsCountToSend, 0);

        controller.HireAgents(agentsToHire);
    }
}


// Need to add failure criteria that is not just a hard time limit:
// Add "Red Dawn remnants" faction that gains power over time
// and generates harder missions.
// Mission failures mean support decrease.
// Once support reaches zero, game is over.
//
// So first need to add the concept of mission difficulty.
//
// -----
//
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
//
// -----
//
// - Try to always keep at least enough agents to maintain full transport capacity
// - Send agents on intel-gathering duty until mission is available
// - Send agents on available mission if not too hard
// - Do not hire agents if it would lead to bankruptcy