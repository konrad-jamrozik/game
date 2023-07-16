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

    private readonly ILog _log;

    public BasicAIPlayerIntellect(ILog log)
    {
        _log = log;
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
            Agents agents = ChooseAgents(state);

            // kja currently there is no incentive for launching missions. They don't give anything.
            controller.LaunchMission(site, agents);
        }

        AssignAvailableAgents(state, controller);
    }

    private static void RecallAgents(GameStatePlayerView state, GameSessionController controller)
    {
        // kja add diag logs about recalling
        var agents = state.Assets.Agents;

        // Here we assume that we get determine agents to recall in given turn before 
        // any agents have been sent on a mission.
        Debug.Assert(agents.OnMission.Count == 0);

        while (agents.CanBeSentOnMissionNextTurn.Count < DesiredAgentMinimalReserve(state)
               && agents.Recallable.Count > 0)
        {
            Agent agentToRecall = controller.RandomGen.PickOneAtRandom(agents.Recallable);
            controller.RecallAgent(agentToRecall);
        }
    }

    /// <summary>
    /// This is the desired minimum of agents that should be available for sending on missions and base defense.
    /// </summary>
    private static int DesiredAgentMinimalReserve(GameStatePlayerView state)
        => state.Assets.MaxTransportCapacity;

    /// <summary>
    /// This is the desired amount of agents for full operational capacity, including:
    /// - launching mission
    /// - defending base / training
    /// - recovery
    /// - operations, like gathering intel or generating income.
    /// </summary>
    /// <param name="state"></param>
    /// <returns></returns>
    private static int DesiredAgentFullComplement(GameStatePlayerView state)
        => state.Assets.MaxTransportCapacity * 2;

    private static bool CanLaunchSomeMission(GameStatePlayerView state)
        => state.MissionSites.Any(site => site.IsActive)
           && state.Assets.CurrentTransportCapacity > 0
           && state.Assets.Agents.Any(agent => agent.CanBeSentOnMission);

    private static MissionSite ChooseMissionSite(GameStatePlayerView state)
        => state.MissionSites.First(site => site.IsActive);

    private static Agents ChooseAgents(GameStatePlayerView state)
    {
        Agents agents = state.Assets.Agents.CanBeSentOnMission
            .Take(state.Assets.CurrentTransportCapacity)
            .ToAgents();

        Debug.Assert(agents.Count > 0);

        return agents;
    }

    private int ComputeAgentsToHire(GameStatePlayerView state)
    {
        int desiredAgentCount = DesiredAgentFullComplement(state);

        int agentsMissingToDesired = desiredAgentCount - state.Assets.Agents.Count;

        int moneyAvailableFor = state.Assets.CurrentMoney / Agent.HireCost;

        // The resulting total upkeep of all agents, including the agents
        // to be hired now, cannot exceed the available funding.
        int maxTolerableUpkeepCost = state.Assets.Funding;
        int currentUpkeepCost = state.Assets.Agents.UpkeepCost;
        int maxUpkeepIncrease = maxTolerableUpkeepCost - currentUpkeepCost;
        int maxAgentIncreaseByUpkeep = maxUpkeepIncrease / Agent.UpkeepCost;
        // If there is enough money in the bank to pay an agent for 10 turns, then we can hire them.
        int maxAgentIncreaseByMoneyReserves = state.Assets.CurrentMoney / (Agent.UpkeepCost * 10);
        int maxAgentIncrease = maxAgentIncreaseByUpkeep + maxAgentIncreaseByMoneyReserves;

        int agentsToHire = Math.Min(
            Math.Min(agentsMissingToDesired, moneyAvailableFor),
            maxAgentIncrease);

        _log.Info(
            $"AIPlayer: ComputeAgentsToHire: " +
            $"agentsToHire: {agentsToHire} | " +
            $"desiredAgentCount: {desiredAgentCount}, " +
            $"agentsMissingToDesired: {agentsMissingToDesired}, " +
            $"moneyAvailableFor: {moneyAvailableFor}, " +
            $"maxAgentIncrease: {maxAgentIncrease}, " +
            $"maxAgentIncreaseByUpkeep: {maxAgentIncreaseByUpkeep}, " +
            $"maxAgentIncreaseByMoneyReserves: {maxAgentIncreaseByMoneyReserves}.");

        return agentsToHire;
    }

    private void AssignAvailableAgents(GameStatePlayerView state, GameSessionController controller)
    {
        int desiredAgentReserve = DesiredAgentMinimalReserve(state);
        int availableAgents = state.Assets.Agents.Available.Count;
        int agentsArrivingNextTurn = state.Assets.Agents.ArrivingNextTurn.Count;

        // Example cases:
        // availableAgents: 10
        // canBeSentOnMissionNextTurn: 17 (10 available + 3 in transit, 4 on mission)
        //
        // Case 1:
        // desiredAgentReserve: 6
        // 17 - 6 = 11
        // Because only 10 agents are available, all will be assigned to ops.
        //
        // Case 2:
        // desiredAgentReserve: 12
        // 17 - 12 = 5
        //
        // Because 10 agents are available, 5 will be assigned to ops, while 5 will be assigned to training.
        // This way, the next turn there will be 12 agents in reserve:
        //   5 in training, 3 currently in transit and 4 currently on mission.
        int agentsToAssignToOps = Math.Min(
            availableAgents, 
            Math.Max(state.Assets.Agents.CanBeSentOnMissionNextTurn.Count - desiredAgentReserve, 0));
        
        // Agents assigned to training, unlike agents assigned to ops, can be reassigned immediately, hence
        // they count towards the desired agent reserve.
        int agentsToAssignToTraining = availableAgents - agentsToAssignToOps;
        int agentsAssignedToOps = 0;
        int agentsAssignedToTraining = 0;

        while (state.Assets.Agents.CanBeSentOnMissionNextTurn.Count > desiredAgentReserve
               && state.Assets.Agents.Available.Count > 0)
        {
            Agent agentToAssign = state.Assets.Agents.Available.RandomSubset(1).Single();
            controller.RandomGen.PickOneAtRandom(AgentActionMap).Invoke(controller, agentToAssign);
            agentsAssignedToOps++;
        }

        state.Assets.Agents.Available.ForEach(agent =>
        {
            controller.SendAgentToTraining(agent);
            agentsAssignedToTraining++;
        });

        _log.Info(
            $"AIPlayer: AssignAvailableAgents: " +
            $"agentsAssignedToOps: {agentsToAssignToOps}, " +
            $"agentsAssignedToTraining: {agentsAssignedToTraining} | " +
            $"desiredAgentReserve: {desiredAgentReserve}, " +
            $"availableAgents: {availableAgents}, " +
            $"agentsArrivingNextTurn: {agentsArrivingNextTurn}.");

        Debug.Assert(
            agentsAssignedToOps == agentsToAssignToOps, 
            $"agentsAssignedToOps: {agentsAssignedToOps} == agentsToAssignToOps: {agentsToAssignToOps}");

        Debug.Assert(
            agentsAssignedToTraining == agentsToAssignToTraining,
            $"agentsAssignedToTraining: {agentsAssignedToTraining} == agentsToAssignToTraining: {agentsToAssignToOps}");

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