using Lib.Contracts;
using UfoGameLib.Lib;

namespace UfoGameLib.Model;

public static class Ruleset
{
    public const int InitialMoney = 500;
    public const int InitialIntel = 0;
    public const int InitialFunding = 20;
    public const int InitialSupport = 30;
    public const int InitialMaxTransportCapacity = 4;

    public const int IntelToWin = 3000;

    public const int AgentHireCost = 50;
    public const int AgentUpkeepCost = 5;
    public const int AgentSurvivalRollUpperBound = 100;
    public const int AgentTrainingCoefficient = 1;

    public const int BaseMissionSiteDifficulty = 30;
    private const int MaxRecoversIn = 30;
    private const int MinSurvivalThreshold = 1; // Any Agent always has at least 1% chance of dying

    public static (bool survived, int recoversIn) RollForAgentSurvival(
        Agent agent,
        Mission mission,
        RandomGen randomGen,
        ILog log)
    {
        int survivalRoll = randomGen.Roll1To(AgentSurvivalRollUpperBound);
        int survivalThreshold = AgentSurvivalThreshold(agent, mission);

        // For an agent to survive, they must roll above the survival threshold, in the range [1..100].
        // Survival threshold of 0 means agent always survives. 
        // Survival threshold of 100 means agent never survives.
        // See also AgentSurvivalChance.
        bool survived = survivalRoll > survivalThreshold;
        int recoversIn = ComputeRecoversIn(survived, survivalRoll, survivalThreshold);
        log.Info(
            $"{agent.LogString} survived {mission.LogString} : {survived,5}. " +
            $"Skill: {agent.SurvivalSkill,3}, Difficulty: {mission.Site.Difficulty,3}, " +
            $"Roll: {survivalRoll,3} { (survived ? "> " : "<=") } {survivalThreshold,3}," +
            $"{(survived ? $" RecoversIn: {recoversIn,3}" : "")}"
            );

        return (survived, recoversIn);
    }

    private static int ComputeRecoversIn(bool survived, int survivalRoll, int survivalThreshold)
    {
        if (!survived)
            return 0;

        int aboveThreshold = survivalRoll - survivalThreshold;
        Contract.Assert(aboveThreshold  >= 1);

        // Subtracting "(aboveThreshold - 1)" instead of just "aboveThreshold"
        // because "aboveThreshold" is always at least 1, so without
        // "-1" the max value of "recoversIn" would be "MaxRecoversIn - 1"
        // not "MaxRecoversIn".
        int recoversIn = Math.Max(MaxRecoversIn - (aboveThreshold - 1), 0);

        return recoversIn;
    }

    // kja2 there is no need to have both a formula and a roll.
    // Instead, I need an abstraction like:
    //
    //   Chance agentSurvivalChance = AgentSurvivalChance(agent, difficulty)
    //   RollResult rollResult = randomGen.Roll1To100();
    //   bool survived = agentSurvivalChance.Result(rollResult)
    //
    // Currently, the implementation of this method (AgentSurvivalChance) is a formula describing 
    // the math behind the implementation of RollForAgentSurvival.
    // Complication: looks like I might be doing a roll separate of the formula because
    // I need exact value of roll to compute recoversIn.
    // Perhaps I will need two formulas, like:
    //
    //   Chance agentSurvivalChance = AgentSurvivalChance(agent, difficulty)
    //   RollResult rollResult = randomGen.Roll1To100();
    //   bool survived = agentSurvivalChance.Result(rollResult)
    //   Interval agentRecoveryInterval = AgentRecoveryInterval()
    //   int recoversIn = agentRecoveryInterval(rollResult);
    /**
     * As of 2/7/2024 the formula is:
     * 100%  + agent survival skill - mission difficulty
     * AND no more than 99%
     * AND no less than 0%
     *
     * BaseMissionSiteDifficulty is 30.
     *
     * As such:
     * - An agent having the same survival skill as mission difficulty will always survive it.
     *   E.g. difficulty of 30 and skill of 30 will result in 100% + 30 - 30 = 100%
     * - Each point of survival skill below mission difficulty is 1% less chance of survival.
     *   E.g. difficulty of 150 and skill of 135 will result in 100% + 135 - 150 = 100 - 15 = 85%
     * - A completely rookie agent has a 70% chance to survive the easiest mission.
     *   100% + 0 - 30 = 70%.
     * - A mission with difficulty of 100 will always kill a 0 skill agent:
     *   100% + 0 - 100 = 0%.
     * - An agent, to "naturally" achieve at least 1% chance of surviving a mission, must have at least
     *   ((mission difficulty - 100) + 1) survival skill.
     *   E.g. a mission with difficulty of 125 will give only 1% chance of survival to any agent
     *   with skill as high as 26: 100% + 26 - 125 = 1%.
     */
    public static int AgentSurvivalChance(Agent agent, int difficulty)
        => AgentSurvivalRollUpperBound - AgentSurvivalThreshold(agent, difficulty);

    public static bool MissionSuccessful(Mission mission, int agentsSurviving)
    {
        int agentsRequired = mission.Site.RequiredSurvivingAgentsForSuccess;
        return agentsSurviving >= agentsRequired;
    }

    public static bool AgentCanSurvive(Agent agent, Mission mission)
        => AgentCanSurvive(agent, mission.Site.Difficulty);

    public static bool AgentCanSurvive(Agent agent, int difficulty)
        => AgentSurvivalChance(agent, difficulty) > 0;

    public static int AgentSurvivalThreshold(Agent agent, Mission mission)
        => AgentSurvivalThreshold(agent, mission.Site.Difficulty);

    public static int AgentSurvivalThreshold(Agent agent, int difficulty)
        => Math.Max(
            difficulty - agent.SurvivalSkill,
            MinSurvivalThreshold);

    public static int AgentSurvivalSkill(Agent agent)
        => agent.TurnsInTraining * AgentTrainingCoefficient + SkillFromMissions(agent);

    private static readonly int[] SkillFromEachFirstMission = [18, 15, 12, 9, 6];

    private static readonly int SkillFromEachMissionBeyondFirstMissions = SkillFromEachFirstMission[^1];

    private static int SkillFromMissions(Agent agent)
    {
        // Note: the implicit assumption here is that if this method is called to compute if agent survived
        // a mission they are currently on, then agent.MissionsSurvived does not include
        // that mission yet. Otherwise, consider border case of first mission: the agent would
        // immediately get the huge boost for surviving first mission, which is not intended.
        Contract.Assert(agent.MissionsSurvived >= 0);
        int skillFromFirstMissions = SkillFromEachFirstMission.Take(agent.MissionsSurvived).Sum();
        int missionsBeyondFirstMissions = Math.Max(agent.MissionsSurvived - SkillFromEachFirstMission.Length, 0);
        return skillFromFirstMissions + missionsBeyondFirstMissions * SkillFromEachMissionBeyondFirstMissions;
    }

    public static (int difficulty, int difficultyFromTurn, int roll) RollMissionSiteDifficulty(
            int currentTurn,
            RandomGen randomGen)
    {
        // Note that currently the only ways of increasing agents survivability of difficulty is:
        // - by surviving missions
        // - via training
        // As such, if difficulty due to turn would grow at least as fast as Agent.TrainingCoefficient,
        // then at some point missions would become impossible, as eventually even the most experienced
        // agents would die, and any new agents would never be able to catch up with mission difficulty.
        int roll = randomGen.Roll0To(30);
        int difficultyFromTurn = currentTurn * AgentTrainingCoefficient / 2;
        return (BaseMissionSiteDifficulty + difficultyFromTurn + roll, difficultyFromTurn, roll);
    }

    public static int RequiredSurvivingAgentsForSuccess(MissionSite site)
    {
        int reqAgentsForSuccess = 1 + (site.Difficulty - BaseMissionSiteDifficulty) / 30;
        Contract.Assert(reqAgentsForSuccess >= 1);
        return reqAgentsForSuccess;
    }

    public static int ComputeFundingChange(int successfulMissions, int failedMissions, int expiredMissionSites)
        => successfulMissions * 5 - failedMissions * 1 - expiredMissionSites * 1;

    public static int ComputeSupportChange(int successfulMissions, int failedMissions, int expiredMissionSites)
        => successfulMissions * 20 - failedMissions * 5 - expiredMissionSites * 5;

    public static int ComputeMoneyChange(int funding, int incomeGenerated, int agentUpkeep)
        => funding + incomeGenerated - agentUpkeep;

    public static int IncomeGeneratedPerAgent() => AgentUpkeepCost * 3;

    public static int IntelGatheredPerAgent() => 5;

    public static int TransportCapacityBuyingCost(int capacity)
        => capacity * 200;
}