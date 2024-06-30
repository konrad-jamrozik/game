using Lib.Contracts;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Players;

public class BasicAIPlayerIntellect : IPlayer
{
    private const int MinimumAcceptableAgentSurvivalChance = 20; // percent
    private const int MoneyThresholdToBuyTransportCapacity = 600;
    private readonly ILog _log;

    public BasicAIPlayerIntellect(ILog log)
    {
        _log = log;
    }

    public void PlayGameTurn(GameStatePlayerView state, GameTurnController controller)
    {
        int agentsToHire = ComputeAgentsToHire(state);
        if (agentsToHire > 0)
            controller.HireAgents(agentsToHire);

        int transportCapacityToBuy = ComputeTransportCapacityToBuy(state);
        if (transportCapacityToBuy > 0)
            controller.BuyTransportCapacity(transportCapacityToBuy);

        RecallAgents(state, controller);

        LaunchMissions(state, controller);

        AssignAvailableAgents(state, controller);

        InvestIntel(state, controller);
    }

    private int ComputeTransportCapacityToBuy(GameStatePlayerView state)
        => state.Assets.Money >= MoneyThresholdToBuyTransportCapacity
           // The number of current agents has to be at least the current max transport capacity,
           // which is still significantly below full complement.
           // There is no point in increasing the transport capacity if we cannot even 
           // get close to the full complement of agents.
           && state.Assets.Agents.Count >= state.Assets.MaxTransportCapacity
            ? 1
            : 0;

    private static bool NoMissionsAvailable(GameStatePlayerView state) => !state.MissionSites.Active.Any();

    private static bool NoAgentsCanBeSentOnMission(GameStatePlayerView state)
        => !state.Assets.Agents.CanBeSentOnMission.Any();

    private static bool NoTransportCapacityAvailable(GameStatePlayerView state)
        => !TransportCapacityAvailable(state);

    private static bool TransportCapacityAvailable(GameStatePlayerView state)
        => state.Assets.CurrentTransportCapacity > 0;

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
    private static int DesiredAgentFullComplement(GameStatePlayerView state)
        => state.Assets.MaxTransportCapacity * 2;

    private void LaunchMissions(GameStatePlayerView state, GameTurnController controller)
    {
        if (NoMissionsAvailable(state) || NoAgentsCanBeSentOnMission(state) || NoTransportCapacityAvailable(state))
            return;

        MissionSites missionSitesOrdByDifficulty = state.MissionSites.Active.OrderBy(site => site.Difficulty).ToMissionSites();

        while (missionSitesOrdByDifficulty.Any() && TransportCapacityAvailable(state))
        {
            var site = missionSitesOrdByDifficulty.First();
            Agents agents = ChooseAgents(site, state);
            if (agents.Any())
                controller.LaunchMission(site, agents);
            else
                break;
        }
    }

    private void RecallAgents(GameStatePlayerView state, GameTurnController controller)
    {
        Agents agents = state.Assets.Agents;

        // Here we assert that we get to determine agents to recall in given turn before 
        // any agents have been sent on a mission.
        Contract.Assert(agents.OnMission.Count == 0);

        int predictedAgents = agents.CanBeSentOnMissionNextTurnMaybe.Count;
        int desiredReserve = DesiredAgentMinimalReserve(state);
        int desiredAgentsToRecallCount = Math.Max(desiredReserve - predictedAgents, 0);

        int recallableAgentsCount = agents.CanBeRecalled.Count;

        int agentsToRecallCount = Math.Min(desiredAgentsToRecallCount, recallableAgentsCount);

        Agents agentsToRecall = controller.RandomGen.Pick(agents.CanBeRecalled, agentsToRecallCount).ToAgents();
        int recalledGeneratingIncome = agentsToRecall.GeneratingIncome.Count;
        int recalledGatheringIntel = agentsToRecall.GatheringIntel.Count;
        if (agentsToRecall.Any())
            controller.RecallAgents(agentsToRecall);

        _log.Debug(
            $"[AI] RecallAgents: " +
            $"agentsRecalled: {agentsToRecall.Count}, " +
            $"generatingIncome: {recalledGeneratingIncome}, " +
            $"gatheringIntel: {recalledGatheringIntel} | " +
            $"desiredAgentsToRecall: {desiredAgentsToRecallCount}, " +
            $"desiredReserve: {desiredReserve}, " +
            $"predictedAgents: {predictedAgents}, " +
            $"recallableAgents: {recallableAgentsCount}.");
    }

    private Agents ChooseAgents(MissionSite site, GameStatePlayerView state)
    {
        Contract.Assert(state.Assets.CurrentTransportCapacity > 0);

        Agents candidateAgents = state.Assets.Agents.CanBeSentOnMission
            // kja2-ai-feat this leaves only few most elite agents. Should try to give chance to mid-tier agents, 
            // depending on their survival chance.
            .OrderByDescending(agent => agent.SurvivalSkill)
            .ToAgents();

        if (!candidateAgents.Any())
        {
            _log.Debug($"[AI] There are no agents left. Not launching mission for {site.LogString}.");
            return new Agents();
        }

        Agents candidateAgentsThatCanSurvive = candidateAgents
            .Where(agent => agent.SurvivalChance(site.Difficulty) >= MinimumAcceptableAgentSurvivalChance)
            .ToAgents();

        if (!candidateAgentsThatCanSurvive.Any())
        {
            _log.Debug(
                $"[AI] There are {candidateAgents.Count} agents available but no agents that could survive mission site " +
                $"with difficulty {site.Difficulty} with " +
                $"the minimum acceptable survival chance of {MinimumAcceptableAgentSurvivalChance}%. " +
                $"Not launching mission for {site.LogString}.");
            return new Agents();
        }

        Agents agents = candidateAgentsThatCanSurvive
            .Take(state.Assets.CurrentTransportCapacity)
            .ToAgents();

        int requiredSurvivingAgentsForSuccess = site.RequiredSurvivingAgentsForSuccess;
        if (requiredSurvivingAgentsForSuccess > agents.Count)
        {
            _log.Debug(
                $"[AI] There are {agents.Count} agents that could be transported to the mission site and survive, " +
                $"but the mission site requires at least {requiredSurvivingAgentsForSuccess} agents. " +
                $"Not launching mission for site {site.LogString}.");
            return new Agents();
        }

        return agents;
    }

    private int ComputeAgentsToHire(GameStatePlayerView state)
    {
        int desiredAgentCount = DesiredAgentFullComplement(state);

        int agentsMissingToDesired = desiredAgentCount - state.Assets.Agents.Count;

        int moneyAvailableFor = state.Assets.Money / Ruleset.AgentsRuleset.AgentHireCost;

        // The resulting total upkeep of all agents, including the agents
        // to be hired now, cannot exceed the available funding.
        int maxTolerableUpkeepCost = state.Assets.Funding;
        int currentUpkeepCost = state.Assets.Agents.UpkeepCost;
        int maxUpkeepIncrease = maxTolerableUpkeepCost - currentUpkeepCost;
        int maxAgentIncreaseByUpkeep = maxUpkeepIncrease / Ruleset.AgentsRuleset.AgentUpkeepCost;
        // If there is enough money in the bank to pay an agent for 10 turns, then we can hire them.
        int maxAgentIncreaseByMoneyReserves = state.Assets.Money / (Ruleset.AgentsRuleset.AgentUpkeepCost * 10);
        int maxAgentIncrease = maxAgentIncreaseByUpkeep + maxAgentIncreaseByMoneyReserves;

        int agentsToHire = Math.Min(
            Math.Min(agentsMissingToDesired, moneyAvailableFor),
            maxAgentIncrease);

        _log.Debug(
            $"[AI] ComputeAgentsToHire: " +
            $"agentsToHire: {agentsToHire} | " +
            $"desiredAgentCount: {desiredAgentCount}, " +
            $"agentsMissingToDesired: {agentsMissingToDesired}, " +
            $"moneyAvailableFor: {moneyAvailableFor}, " +
            $"maxAgentIncrease: {maxAgentIncrease}, " +
            $"maxAgentIncreaseByUpkeep: {maxAgentIncreaseByUpkeep}, " +
            $"maxAgentIncreaseByMoneyReserves: {maxAgentIncreaseByMoneyReserves}.");

        return agentsToHire;
    }

    private void AssignAvailableAgents(GameStatePlayerView state, GameTurnController controller)
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
        // canBeSentOnMissionNextTurnForSure: 17 (10 available + 7 in transit)
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
        //   5 in training and 7 currently in transit.
        int agentsToSendToOps = Math.Min(
            agents.Available.Count,
            Math.Max(agentsCanBeSentOnMissionNextTurnForSure.Count - desiredAgentReserve, 0));

        // kja2-ai-feat need smarter approach to money management: if low of funds, assign more agents to generate income,
        // possibly by recalling agents. This takes priority even above minimum reserve.
        // Also, in a pinch can sack rookie agents.

        int agentsToSendToGenerateIncomeCount = agentsToSendToOps / 2;
        int agentsToSendToGatherIntelCount = agentsToSendToOps / 2;
        if (agentsToSendToOps % 2 == 1)
        {
            if (controller.RandomGen.FlipCoin())
                agentsToSendToGenerateIncomeCount++;
            else
                agentsToSendToGatherIntelCount++;
        }
        Contract.Assert(agentsToSendToGenerateIncomeCount + agentsToSendToGatherIntelCount == agentsToSendToOps);

        Agents agentsToSendToGenerateIncome = controller.RandomGen.Pick(agents.Available, agentsToSendToGenerateIncomeCount).ToAgents();
        if (agentsToSendToGenerateIncome.Any())
            controller.SendAgentsToGenerateIncome(agentsToSendToGenerateIncome);
        Agents agentsToSendToGatherIntel = controller.RandomGen.Pick(agents.Available, agentsToSendToGatherIntelCount).ToAgents();
        if (agentsToSendToGatherIntel.Any())
            controller.SendAgentsToGatherIntel(agentsToSendToGatherIntel);

        int agentsToSendToTrainingCount = agents.Available.Count;
        Agents agentsToSendToTraining = agents.Available;
        if (agentsToSendToTraining.Any())
        {
            // Send all remaining agents to training. Such agents are available immediately,
            // so they count towards the desired agent reserve.
            controller.SendAgentsToTraining(agents.Available);
        }

        _log.Debug(
            $"[AI] AssignAvailableAgents: " +
            $"agentsSentToOps: {agentsToSendToOps}, " +
            $"agentsSentToGenerateIncome: {agentsToSendToGenerateIncomeCount}, " +
            $"agentsSentToGatherIntel: {agentsToSendToGatherIntelCount}, " +
            $"agentsSentToTraining: {agentsToSendToTrainingCount} | " +
            $"desiredAgentReserve: {desiredAgentReserve}, " +
            $"availableAgents: {initialAvailableAgents}.");

        Contract.Assert(
            state.Assets.Agents.GeneratingIncome.Count == initialAgentsGeneratingIncome + agentsToSendToGenerateIncomeCount);
        Contract.Assert(
            state.Assets.Agents.GatheringIntel.Count == initialAgentsGatheringIntel + agentsToSendToGatherIntelCount);
        Contract.Assert(state.Assets.Agents.InTraining.Count == initialAgentsInTraining + agentsToSendToTrainingCount);
        Contract.Assert(state.Assets.Agents.Available.Count == 0);
    }

    private void InvestIntel(GameStatePlayerView state, GameTurnController controller)
    {
        if (state.Assets.Intel >= 5)
        {
            Faction faction = state.Factions.MinBy(faction => faction.IntelInvested)!;
            controller.InvestIntel(faction, state.Assets.Intel);
        }
    }
}
