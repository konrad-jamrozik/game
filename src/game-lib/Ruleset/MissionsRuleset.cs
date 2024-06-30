using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Ruleset;

public static class MissionsRuleset
{
    public const int MissionSiteSurvivalBaseDifficultyRequirement = 30;
    public const int MissionSiteTurnsUntilExpiration = 3;
    public static readonly (double min, double max) MissionSiteDifficultyVariationRange = (min: -0.3, max: 0.3);

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

    public static MissionSiteModifiers ComputeMissionSiteModifiers(IRandomGen randomGen, Faction faction, int difficulty)
    {
        // kja2-feat these formulas should depend on factions.
        // E.g.:
        // - Black Lotus is average / baseline
        // - EXALT provides more intel than average
        // - Red Dawn provides more money than average
        // - Zombies provide:
        //     - zero intel
        //     - much less funding
        //     - and support rewards and penalties are amplified

        double baseMoneyReward = (faction.Power / 10) + (faction.IntelInvested / 10d);
        (int moneyReward, _) = randomGen.RollVariationAndRound(baseMoneyReward, (min: -0.5, max: 0.5));

        double baseIntelReward = faction.Power / 10;
        (int intelReward, _) = randomGen.RollVariationAndRound(baseIntelReward, (min: -0.5, max: 0.5));

        double baseFundingReward = 5 + faction.Power / 10;
        (int fundingReward, _) = randomGen.RollVariationAndRound(baseFundingReward, (min: -0.5, max: 0.5));

        double baseFundingPenalty = 1 + faction.Power / 10;
        (int fundingPenalty, _) = randomGen.RollVariationAndRound(baseFundingPenalty, (min: -0.5, max: 0.5));

        double baseSupportReward = 20 + faction.Power / 10;
        (int supportReward, _) = randomGen.RollVariationAndRound(baseSupportReward, (min: -0.5, max: 0.5));

        double baseSupportPenalty = 20 + faction.Power / 10;
        (int supportPenalty, _) = randomGen.RollVariationAndRound(baseSupportPenalty, (min: -0.5, max: 0.5));

        double basePowerDamageReward = 2 + (faction.Power / 10) + (faction.IntelInvested / 10d);
        (int powerDamageReward, _) = randomGen.RollVariationAndRound(basePowerDamageReward, (min: -0.2, max: 0.2));

        return new MissionSiteModifiers(
            moneyReward: moneyReward,
            intelReward: intelReward,
            fundingReward: fundingReward,
            supportReward: supportReward,
            fundingPenalty: fundingPenalty,
            supportPenalty: supportPenalty,
            powerDamageReward: powerDamageReward,
            powerClimbDamageReward: 0,
            powerAccelerationDamageReward: 0);
    }
}