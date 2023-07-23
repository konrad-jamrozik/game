using UfoGameLib.Lib;
using UfoGameLib.State;

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
        bool survived = survivalRoll > survivalThreshold;
        int recoversIn = ComputeRecoversIn(survived, survivalRoll, survivalThreshold);
        log.Info(
            $"{agent.LogString} survived {mission.LogString} : {survived,5}. " +
            $"Skill: {AgentSurvivalSkill(agent),3}, Difficulty: {mission.Site.Difficulty,3}, " +
            $"Roll: {survivalRoll,3} { (survived ? "> " : "<=") } {survivalThreshold}," +
            $"{(survived ? $" RecoversIn: {recoversIn,3}" : "")}"
            );

        return (survived, recoversIn);
    }

    private static int ComputeRecoversIn(bool survived, int survivalRoll, int survivalThreshold)
    {
        if (!survived)
            return 0;

        int aboveThreshold = survivalRoll - survivalThreshold;
        Debug.Assert(aboveThreshold  >= 1);

        int recoversIn = Math.Max(31 - aboveThreshold, 0);

        return recoversIn;
    }

    // The implementation of this method is a formula describing 
    // the implementation of RollForAgentSurvival.
    public static int AgentSurvivalChance(Agent agent, int difficulty)
        => AgentSurvivalRollUpperBound - AgentSurvivalThreshold(agent, difficulty);

    public static bool MissionSuccessful(Mission mission, int agentsSurviving)
    {
        int agentsRequired = RequiredSurvivingAgentsForSuccess(mission.Site);
        return agentsSurviving >= agentsRequired;
    }

    public static bool AgentCanSurvive(Agent agent, Mission mission)
        => AgentCanSurvive(agent, mission.Site.Difficulty);

    public static bool AgentCanSurvive(Agent agent, int difficulty)
        => AgentSurvivalThreshold(agent, difficulty) <= AgentSurvivalRollUpperBound;

    public static int AgentSurvivalThreshold(Agent agent, Mission mission)
        => AgentSurvivalThreshold(agent, mission.Site.Difficulty);

    public static int AgentSurvivalThreshold(Agent agent, int difficulty)
        => Math.Max(
            difficulty - AgentSurvivalSkill(agent),
            0);

    // kja add Agent.SurvivalSkill delegate
    // kja increase skill by MissionsLaunched / Succeeded / Failed
    public static int AgentSurvivalSkill(Agent agent) => agent.TurnsInTraining * AgentTrainingCoefficient;

    public static (int difficulty, int difficultyFromTurn, int roll) RollMissionSiteDifficulty(
            int currentTurn,
            RandomGen randomGen)
    {
        // Note that currently the only way of increasing agents survivability of difficulty
        // is via training. As such, if difficulty due to turn would grow at least as fast as Agent.TrainingCoefficient,
        // then at some point missions would become impossible, as all agents would die.
        int roll = randomGen.Roll0To(30);
        int difficultyFromTurn = currentTurn * AgentTrainingCoefficient / 2;
        return (BaseMissionSiteDifficulty + difficultyFromTurn + roll, difficultyFromTurn, roll);
    }

    public static int RequiredSurvivingAgentsForSuccess(MissionSite site)
    {
        int result = 1 + (site.Difficulty - BaseMissionSiteDifficulty) / 30;
        Debug.Assert(result >= 1);
        return result;
    }

    public static int ComputeFundingChange(int successfulMissions, int failedMissions, int expiredMissions)
        => successfulMissions * 5 - failedMissions * 1 - expiredMissions * 1;

    public static int ComputeSupportChange(int successfulMissions, int failedMissions, int expiredMissions)
        => successfulMissions * 20 - failedMissions * 5 - expiredMissions * 5;

    public static int ComputeMoneyChange(int funding, int incomeGenerated, int agentUpkeep)
        => funding + incomeGenerated - agentUpkeep;

    public static int IncomeGeneratedPerAgent() => AgentUpkeepCost * 3;

    public static int IntelGatheredPerAgent() => 5;

    public static int TransportCapacityBuyingCost(int capacity)
        => capacity * 200;
}