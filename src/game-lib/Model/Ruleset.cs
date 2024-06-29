using Lib.Contracts;
using UfoGameLib.Lib;

namespace UfoGameLib.Model;

// kja2-refactor convert "Ruleset" class into a namespace. Maybe introduce IRuleset "marker" interface?
public static class Ruleset
{
    public const int InitialMoney = 500;
    public const int InitialIntel = 0;
    public const int InitialFunding = 20;
    public const int InitialSupport = 30;
    public const int InitialMaxTransportCapacity = 4;

    // For more example factions data, see:
    // https://github.com/konrad-jamrozik/game/blob/eccb44a1d5f074e95b07aebca2c6bc5bbfdfdda8/src/ufo-game/Model/Data/FactionsData.cs#L34
    public static Factions InitFactions(IRandomGen randomGen) => new(
    [
        // Note: need to ensure here that IDs are consecutive, and from zero.
        // kja also, frontend diagram chart shows the increased precision (e.g. 100) while datagrid shows normalized (e.g. 10).
        Faction.Init(randomGen, id: 0, "Black Lotus cult"  , power: 20, powerClimb: 0.4, powerAcceleration: 0.008 ),
        Faction.Init(randomGen, id: 1, "Red Dawn remnants" , power: 30, powerClimb: 0.5, powerAcceleration: 0.005 ),
        Faction.Init(randomGen, id: 2, "EXALT"             , power: 40, powerClimb: 0.6, powerAcceleration: 0.004 ),
        Faction.Init(randomGen, id: 3, "Zombies"           , power: 10, powerClimb: 0.1, powerAcceleration: 0.02  )
    ]);

    public const int IntelToWin = 3000;

    public const int AgentHireCost = 50;
    public const int AgentUpkeepCost = 5;
    public const int AgentTrainingCoefficient = 1;
    public const int AgentBaseSurvivalSkill = 100;

    public const int MissionSiteSurvivalBaseDifficultyRequirement = 30;
    public static readonly Range FactionMissionSiteCountdownRange = new Range(3, 10);
    public static readonly (double min, double max) MissionSiteDifficultyVariationRange = (min: -0.3, max: 0.3);
    public const int MissionSiteTurnsUntilExpiration = 3;

    public static (bool survived, int? recoversIn) RollForAgentSurvival(
        ILog log,
        IRandomGen randomGen,
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
        // immediately get the huge boost for surviving first mission while on the first mission, which is not intended.
        Contract.Assert(agent.MissionsSurvived >= 0);
        int skillFromFirstMissions = SkillFromEachFirstMission.Take(agent.MissionsSurvived).Sum();
        int missionsBeyondFirstMissions = Math.Max(agent.MissionsSurvived - SkillFromEachFirstMission.Length, 0);
        return skillFromFirstMissions + missionsBeyondFirstMissions * SkillFromEachMissionBeyondFirstMissions;
    }

    public static (int difficulty, double baseDifficulty, double variationRoll) RollMissionSiteDifficulty(
        IRandomGen randomGen,
        Faction faction)
    {
        // Note that currently the only ways of increasing agents survivability of difficulty is:
        // - by surviving missions
        // - via training
        // As such, if difficulty per turn would grow at least as fast as Ruleset.AgentTrainingCoefficient,
        // then at some point missions would become impossible, as eventually even the most experienced
        // agents would die, and any new agents would never be able to catch up with mission difficulty.
        double baseDifficulty = faction.Power;
        (int difficulty, double variationRoll) = randomGen.RollVariationAndRound(
            baseValue: baseDifficulty,
            MissionSiteDifficultyVariationRange);
        return (difficulty, baseDifficulty, variationRoll);
    }

    public static int RequiredSurvivingAgentsForSuccess(MissionSite site)
    {
        int reqAgentsForSuccess = 1 + site.Difficulty / MissionSiteSurvivalBaseDifficultyRequirement;
        Contract.Assert(reqAgentsForSuccess >= 1);
        return reqAgentsForSuccess;
    }

    public static int ComputeFundingChange(
        List<Mission> successfulMissions,
        List<Mission> failedMissions,
        List<MissionSite> expiredMissionSites)
        => successfulMissions.Sum(mission => mission.Site.Modifiers.FundingReward)
           - failedMissions.Sum(mission => mission.Site.Modifiers.FundingPenalty)
           - expiredMissionSites.Sum(site => site.Modifiers.FundingPenalty);

    public static int ComputeSupportChange(
        List<Mission> successfulMissions,
        List<Mission> failedMissions,
        List<MissionSite> expiredMissionSites)
        => successfulMissions.Sum(mission => mission.Site.Modifiers.SupportReward)
           - failedMissions.Sum(mission => mission.Site.Modifiers.SupportPenalty)
           - expiredMissionSites.Sum(site => site.Modifiers.SupportPenalty);

    public static int ComputeMoneyChange(Assets assets, List<Mission> successfulMissions, int agentUpkeep)
    {
        int funding = assets.Funding;
        int incomeGenerated = assets.Agents.GeneratingIncome.Count * IncomeGeneratedPerAgent();
        int moneyRewardFromMissions = successfulMissions.Sum(mission => mission.Site.Modifiers.MoneyReward);

        return funding + incomeGenerated + moneyRewardFromMissions - agentUpkeep;
    }

    public static int ComputeIntelChange(Assets assets, List<Mission> successfulMissions)
    {
        int intelGathered = assets.Agents.GatheringIntel.Count * IntelGatheredPerAgent();
        int intelFromMissions = successfulMissions.Sum(mission => mission.Site.Modifiers.IntelReward);
        return intelGathered + intelFromMissions;
    }

    public static int IncomeGeneratedPerAgent() => AgentUpkeepCost * 3;

    public static int IntelGatheredPerAgent() => 5;

    public static int TransportCapacityBuyingCost(int capacity)
        => capacity * 200;
}
