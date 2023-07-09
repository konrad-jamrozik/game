using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

public class BasicAIPlayerIntellect : IAIPlayerIntellect
{
    private static readonly Dictionary<int, Action<GameSessionController, Agent>> AgentActionMap =
        new Dictionary<int, Action<GameSessionController, Agent>>
        {
            [1] = (controller, agent) => controller.SendAgentToGatherIntel(agent),
            [2] = (controller, agent) => controller.SendAgentToGenerateIncome(agent),
        };

    private static int ComputeAgentsToHire(GameStatePlayerView state)
    {
        // Strive to always have thrice as many agents as transport capacity,
        // to keep adequate reserves for defense, buffer for recovery and
        // to gather intel or generate income.
        int desiredAgentCount = state.Assets.MaxTransportCapacity * 3;

        int agentsMissingToDesired = desiredAgentCount - state.Assets.Agents.Count;

        int moneyAvailableFor = state.Assets.CurrentMoney / Agent.HireCost;

        // The resulting total upkeep of all agents, including the agents
        // to be hired now, cannot exceed the available funding.
        int maxTolerableUpkeepCost = state.Assets.Funding;
        int currentUpkeepCost = state.Assets.Agents.TotalUpkeepCost;
        int maxUpkeepIncrease = maxTolerableUpkeepCost - currentUpkeepCost;
        int maxAgentIncreaseByUpkeep = maxUpkeepIncrease / Agent.UpkeepCost;

        int agentsToHire = Math.Min(
            Math.Min(agentsMissingToDesired, moneyAvailableFor),
            maxAgentIncreaseByUpkeep);

        Console.Out.WriteLine(
            $"AIPlayer: ComputeAgentsToHire: " +
            $"agentsMissingToDesired: {agentsMissingToDesired}, " +
            $"moneyAvailableFor: {moneyAvailableFor}, " +
            $"maxAgentIncreaseByUpkeep: {maxAgentIncreaseByUpkeep}, " +
            $"agentsToHire: {agentsToHire}");

        return agentsToHire;
    }

    private static void RecallAgents(GameStatePlayerView state, GameSessionController controller)
    {
        var agents = state.Assets.Agents;
        // Here we assume that we determine agents to recall in given turn before 
        // any agents have been sent on a mission.
        Debug.Assert(agents.OnMission.Count == 0);

        while (agents.CanBeSentOnMissionNextTurn.Count < DesiredAgentReserve(state)
               && agents.Recallable.Count > 0)
        {
            Agent agentToRecall = agents.Recallable.RandomSubset(1).Single();
            controller.RecallAgent(agentToRecall);
        }
    }

    private static int DesiredAgentReserve(GameStatePlayerView state)
        => state.Assets.MaxTransportCapacity * 2;

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive)
           && state.Assets.CurrentTransportCapacity > 0
           && state.Assets.Agents.Any(agent => agent.CanBeSentOnMission);

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static List<Agent> ChooseAgents(GameStatePlayerView state)
    {
        List<Agent> agents = state.Assets.Agents.CanBeSentOnMission
            .Take(state.Assets.CurrentTransportCapacity)
            .ToList();

        Debug.Assert(agents.Count > 0);

        return agents;
    }

    private static void AssignAvailableAgents(GameStatePlayerView state, GameSessionController controller)
    {
        Console.Out.WriteLine(
            $"AIPlayer: AssignAvailableAgents. " +
            $"Count: {state.Assets.Agents.CanBeSentOnMissionNextTurn.Count}, " +
            $"Desired: {DesiredAgentReserve(state)}");

        while (state.Assets.Agents.CanBeSentOnMissionNextTurn.Count > DesiredAgentReserve(state))
        {
            Agent agentToAssign = state.Assets.Agents.Available.RandomSubset(1).Single();
            AgentActionMap[controller.Random.Next(AgentActionMap.Keys.Count)].Invoke(controller, agentToAssign);
        }

        state.Assets.Agents.Available.ForEach(controller.SendAgentToTraining);
    }

    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        // kja2 curr work PlayGameTurnWithBasicIntellect: see also note at file bottom.

        int agentsToHire = ComputeAgentsToHire(state);
        if (agentsToHire > 0)
            controller.HireAgents(agentsToHire);

        RecallAgents(state, controller);

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