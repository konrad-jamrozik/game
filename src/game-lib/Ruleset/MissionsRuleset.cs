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
}