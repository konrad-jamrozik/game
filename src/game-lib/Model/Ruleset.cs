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
    public const int AgentTrainingCoefficient = 1;
    public const int AgentBaseSurvivalSkill = 100;

    public const int BaseMissionSiteDifficulty = 30;

    public static (bool survived, int? recoversIn) RollForAgentSurvival(
        ILog log,
        RandomGen randomGen,
        Agent agent,
        Mission mission)
    {
        var roll = new AgentSurvivalRoll(log, randomGen, agent, mission);
        return (roll.Survived, roll.RecoversIn);
    }

    public static bool MissionSuccessful(Mission mission, int agentsSurviving)
    {
        int agentsRequired = mission.Site.RequiredSurvivingAgentsForSuccess;
        return agentsSurviving >= agentsRequired;
    }

    public static int AgentSurvivalSkill(Agent agent)
        => AgentBaseSurvivalSkill + agent.TurnsInTraining * AgentTrainingCoefficient + SkillFromMissions(agent);

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