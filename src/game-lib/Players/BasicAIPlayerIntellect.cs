using UfoGameLib.Controller;
using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Players;

public class BasicAIPlayerIntellect : IAIPlayerIntellect
{
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
            // Need to implement consequence of mission failure and success, as well
            // as not engaging in mission before its expiration.
            // Hence need to implement:
            // - mission expiration after N turns
            // - support: + on mission win, - on mission loss or expiration
            // Game to be lost when support gets too low. Starts at 100, loss
            // at 0.
            controller.LaunchMission(site, agents);
        }

        AssignAvailableAgents(state, controller);
    }

    private void RecallAgents(GameStatePlayerView state, GameSessionController controller)
    {
        Agents agents = state.Assets.Agents;

        // Here we assume that we get determine agents to recall in given turn before 
        // any agents have been sent on a mission.
        Debug.Assert(agents.OnMission.Count == 0);

        int predictedAgents = agents.CanBeSentOnMissionNextTurnMaybe.Count;
        int desiredReserve = DesiredAgentMinimalReserve(state);
        int desiredAgentsToRecallCount = Math.Max(desiredReserve - predictedAgents, 0);

        int recallableAgentsCount = agents.Recallable.Count;

        int agentsToRecallCount = Math.Min(desiredAgentsToRecallCount, recallableAgentsCount);

        Agents agentsToRecall = controller.RandomGen.Pick(agents.Recallable, agentsToRecallCount).ToAgents();
        int recalledGeneratingIncome = agentsToRecall.GeneratingIncome.Count;
        int recalledGatheringIntel = agentsToRecall.GatheringIntel.Count;
        controller.RecallAgents(agentsToRecall);

        _log.Info(
            $"AIPlayer: RecallAgents: " +
            $"agentsRecalled: {agentsToRecall.Count}, " +
            $"generatingIncome: {recalledGeneratingIncome}, " +
            $"gatheringIntel: {recalledGatheringIntel} | " +
            $"desiredAgentsToRecall: {desiredAgentsToRecallCount}, " +
            $"desiredReserve: {desiredReserve}, " +
            $"predictedAgents: {predictedAgents}, " +
            $"recallableAgents: {recallableAgentsCount}.");
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

        int moneyAvailableFor = state.Assets.Money / Agent.HireCost;

        // The resulting total upkeep of all agents, including the agents
        // to be hired now, cannot exceed the available funding.
        int maxTolerableUpkeepCost = state.Assets.Funding;
        int currentUpkeepCost = state.Assets.Agents.UpkeepCost;
        int maxUpkeepIncrease = maxTolerableUpkeepCost - currentUpkeepCost;
        int maxAgentIncreaseByUpkeep = maxUpkeepIncrease / Agent.UpkeepCost;
        // If there is enough money in the bank to pay an agent for 10 turns, then we can hire them.
        int maxAgentIncreaseByMoneyReserves = state.Assets.Money / (Agent.UpkeepCost * 10);
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
        Agents agents = state.Assets.Agents;

        int initialAgentsGeneratingIncome = agents.GeneratingIncome.Count;
        int initialAgentsGatheringIntel = agents.GatheringIntel.Count;
        int initialAgentsInTraining = agents.InTraining.Count;
        int initialAvailableAgents = agents.Available.Count;

        Agents agentsCanBeSentOnMissionNextTurnForSure = agents.CanBeSentOnMissionNextTurnForSure;

        // Example cases:
        // availableAgents: 10
        // canBeSentOnMissionNextTurnForSure: 17 (10 available + 7 in transit(, 4 on mission)
        //
        // Case 1:
        // desiredAgentReserve: 6
        // 17 - 6 = 11
        // Because only 10 agents are available, all will be sent to ops.
        //
        // Case 2:
        // desiredAgentReserve: 12
        // 17 - 12 = 5
        //
        // Because 10 agents are available, 5 will be sent to ops, while 5 will be sent to training.
        // This way, the next turn there will be 12 agents in reserve (as desired):
        //   5 in training, 3 currently in transit and 4 currently on mission.
        int agentsToSendToOps = Math.Min(
            agents.Available.Count, 
            Math.Max(agentsCanBeSentOnMissionNextTurnForSure.Count - desiredAgentReserve, 0));
        
        int agentsToSendToGenerateIncome = agentsToSendToOps / 2;
        int agentsToSendToGatherIntel = agentsToSendToOps - agentsToSendToGenerateIncome;

        controller.SendAgentsToGenerateIncome(
            controller.RandomGen.Pick(agents.Available, agentsToSendToGenerateIncome).ToAgents());
        controller.SendAgentsToGatherIntel(
            controller.RandomGen.Pick(agents.Available, agentsToSendToGatherIntel).ToAgents());

        int agentsSentToTraining = agents.Available.Count;
        
        // Send all remaining agents to training. Such agents are available immediately,
        // so they count towards the desired agent reserve.
        controller.SendAgentsToTraining(agents.Available);

        _log.Info(
            $"AIPlayer: AssignAvailableAgents: " +
            $"agentsSentToOps: {agentsToSendToOps}, " +
            $"agentsSentToGenerateIncome: {agentsToSendToGenerateIncome}, " +
            $"agentsSentToGatherIntel: {agentsToSendToGatherIntel}, " +
            $"agentsSentToTraining: {agentsSentToTraining} | " +
            $"desiredAgentReserve: {desiredAgentReserve}, " +
            $"availableAgents: {initialAvailableAgents}.");

        Debug.Assert(state.Assets.Agents.GeneratingIncome.Count == initialAgentsGeneratingIncome + agentsToSendToGenerateIncome);
        Debug.Assert(state.Assets.Agents.GatheringIntel.Count == initialAgentsGatheringIntel + agentsToSendToGatherIntel);
        Debug.Assert(state.Assets.Agents.InTraining.Count == initialAgentsInTraining + agentsSentToTraining);
        Debug.Assert(state.Assets.Agents.Available.Count == 0);
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