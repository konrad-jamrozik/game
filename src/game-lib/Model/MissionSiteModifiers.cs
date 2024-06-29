using System.Text.Json.Serialization;
using UfoGameLib.Lib;

namespace UfoGameLib.Model;

public record MissionSiteModifiers
{
    public readonly int MoneyReward;
    public readonly int IntelReward;
    public readonly int FundingReward;
    public readonly int SupportReward;
    public readonly int FundingPenalty;
    public readonly int SupportPenalty;
    public readonly int PowerDamageReward;
    public readonly int PowerClimbDamageReward;
    public readonly int PowerAccelerationDamageReward;

    [JsonConstructor]
    public MissionSiteModifiers(
        int moneyReward,
        int intelReward,
        int fundingReward,
        int supportReward,
        int fundingPenalty,
        int supportPenalty,
        int powerDamageReward,
        int powerClimbDamageReward,
        int powerAccelerationDamageReward)
    {
        MoneyReward = moneyReward;
        IntelReward = intelReward;
        FundingReward = fundingReward;
        SupportReward = supportReward;
        FundingPenalty = fundingPenalty;
        SupportPenalty = supportPenalty;
        PowerDamageReward = powerDamageReward;
        PowerClimbDamageReward = powerClimbDamageReward;
        PowerAccelerationDamageReward = powerAccelerationDamageReward;
    }

    public MissionSiteModifiers(
        int? moneyReward = null,
        int? intelReward = null,
        int? fundingReward = null,
        int? supportReward = null,
        int? powerDamageReward = null,
        int? powerClimbDamageReward = null,
        int? powerAccelerationDamageReward = null,
        int? fundingPenalty = null,
        int? supportPenalty = null) : this(
        moneyReward ?? 0,
        intelReward ?? 0,
        fundingReward ?? 0,
        supportReward ?? 0,
        fundingPenalty ?? 0,
        supportPenalty ?? 0,
        powerDamageReward ?? 0,
        powerClimbDamageReward ?? 0,
        powerAccelerationDamageReward ?? 0)
    {
    }

    // kja-refact introduce FactionsRuleset for this and other Faction based rules
    public static MissionSiteModifiers Compute(IRandomGen randomGen, Faction faction, int difficulty)
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

    public MissionSiteModifiers DeepClone()
        => (MissionSiteModifiers)MemberwiseClone();
}
