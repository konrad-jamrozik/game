using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

public class BasicAIPlayerIntellect : IAIPlayerIntellect
{
    private static readonly Dictionary<int, Action<Agent>> AgentActionMap = new Dictionary<int, Action<Agent>>
    {
        [0] = agent => agent.SendToTraining(),
        [1] = agent => agent.GatherIntel(),
        [2] = agent => agent.GenerateIncome(),
    };

    private static void AssignAvailableAgents(GameStatePlayerView state, GameSessionController controller)
    {
        state.Assets.Agents.Available.ForEach(
            agent => AgentActionMap[controller.Random.Next(3)].Invoke(agent));
    }

    private static int ComputeAgentsToHire(GameStatePlayerView state)
    {
        // Strive to always have twice as many agents as transport capacity,
        // to keep adequate reserves for defense and buffer for recovery.
        int desiredAgentCount = state.Assets.MaxTransportCapacity * 2;

        int agentsMissingToDesired = desiredAgentCount - state.Assets.Agents.Count;
        
        int moneyAvailableFor = state.Assets.CurrentMoney / Agent.HireCost;

        // The resulting total upkeep of all agents, including the agents
        // to be hired now, cannot exceed the available funding.
        int maxTolerableUpkeepCost = state.Assets.Funding / Agent.UpkeepCost;
        int currentUpkeepCost = state.Assets.Agents.TotalUpkeepCost;
        int maxUpkeepIncrease = maxTolerableUpkeepCost - currentUpkeepCost;
        int maxAgentIncreaseByUpkeep = maxUpkeepIncrease / Agent.UpkeepCost;

        int maxAgentsToHire = Math.Min(
            Math.Min(agentsMissingToDesired, moneyAvailableFor),
            maxAgentIncreaseByUpkeep);

        return maxAgentsToHire;
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive)
           && state.Assets.CurrentTransportCapacity > 0
           // kja this will have only Available and Training agents, but not GatheringIntel or GeneratingIncome
           // Need to do the following:
           // - an agent gathering intel or generating income can be recalled, making them go into InTransit state where 
           // they'll become available next turn
           // - the AI player needs to decide how many agents to keep in reserve for missions and allocate/recall
           // as appropriate.
           && state.Assets.Agents.Any(agent => agent.CanBeSentOnMission);

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static List<Agent> ChooseAgents(GameStatePlayerView state)
    {
        List<Agent> agents = state.Assets.Agents.CanBeSentOnMission
            .Take(state.Assets.CurrentTransportCapacity)
            .ToList();

        Debug.Assert(agents.Any());

        return agents;
    }

    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        // kja2 curr work PlayGameTurnWithBasicIntellect: see also note at file bottom.
        
        int agentsToHire = ComputeAgentsToHire(state);
        if (agentsToHire > 0)
            controller.HireAgents(agentsToHire);

        while (CanLaunchSomeMission(state))
        {
            MissionSite site = ChooseMissionSite(state);
            List<Agent> agents = ChooseAgents(state);

            controller.LaunchMission(site, agents);
        }

        AssignAvailableAgents(state, controller);

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