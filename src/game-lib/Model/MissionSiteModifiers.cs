using System.Text.Json.Serialization;
using UfoGameLib.Lib;

namespace UfoGameLib.Model;

// kja Changes to MissionSite to make:
// - add props for (money, intel, funding, support), both reward if won and penalty if lost or expired.
// - add props for: faction damage: reduction of (power, power increase, power acceleration), if mission won
public record MissionSiteModifiers
{
    public readonly int MoneyReward;
    public readonly int IntelReward;
    public readonly int FundingReward;
    public readonly int SupportReward;
    public readonly int PowerDamageReward;
    public readonly int PowerIncreaseDamageReward;
    public readonly int PowerAccelerationDamageReward;
    public readonly int FundingPenalty;
    public readonly int SupportPenalty;

    [JsonConstructor]
    public MissionSiteModifiers(
        int moneyReward,
        int intelReward,
        int fundingReward,
        int supportReward,
        int powerDamageReward,
        int powerIncreaseDamageReward,
        int powerAccelerationDamageReward,
        int fundingPenalty,
        int supportPenalty)
    {
        MoneyReward = moneyReward;
        IntelReward = intelReward;
        FundingReward = fundingReward;
        SupportReward = supportReward;
        PowerDamageReward = powerDamageReward;
        PowerIncreaseDamageReward = powerIncreaseDamageReward;
        PowerAccelerationDamageReward = powerAccelerationDamageReward;
        FundingPenalty = fundingPenalty;
        SupportPenalty = supportPenalty;
    }

    public MissionSiteModifiers(
        int? moneyReward = null,
        int? intelReward = null,
        int? fundingReward = null,
        int? supportReward = null,
        int? powerDamageReward = null,
        int? powerIncreaseDamageReward = null,
        int? powerAccelerationDamageReward = null,
        int? fundingPenalty = null,
        int? supportPenalty = null) : this(
        moneyReward ?? 0,
        intelReward ?? 0,
        fundingReward ?? 0,
        supportReward ?? 0,
        powerDamageReward ?? 0,
        powerIncreaseDamageReward ?? 0,
        powerAccelerationDamageReward ?? 0,
        fundingPenalty ?? 0,
        supportPenalty ?? 0
    )
    {
    }

    // kja2-refact introduce FactionsRuleset for this and other Faction based rules
    public static MissionSiteModifiers Compute(IRandomGen randomGen, Faction faction)
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
        
        int baseMoneyReward = faction.Power / Ruleset.FactionPowerResolution;
        (int moneyReward, _) = randomGen.RollVariation(baseMoneyReward, -50, 50, 100);

        int baseIntelReward = faction.Power / Ruleset.FactionPowerResolution;
        (int intelReward, _) = randomGen.RollVariation(baseIntelReward, -50, 50, 100);

        int baseFundingReward = 5 + faction.Power / 10 / Ruleset.FactionPowerResolution;
        (int fundingReward, _) = randomGen.RollVariation(baseFundingReward, -50, 50, 100);

        int baseFundingPenalty = 1 + faction.Power / 10 / Ruleset.FactionPowerResolution;
        (int fundingPenalty, _) = randomGen.RollVariation(baseFundingPenalty, -50, 50, 100);

        int baseSupportReward = 20 + faction.Power / 10 / Ruleset.FactionPowerResolution;
        (int supportReward, _) = randomGen.RollVariation(baseSupportReward, -50, 50, 100);

        int baseSupportPenalty = 20 + faction.Power / 10 / Ruleset.FactionPowerResolution;
        (int supportPenalty, _) = randomGen.RollVariation(baseSupportPenalty, -50, 50, 100);

        return new MissionSiteModifiers(
            moneyReward: moneyReward,
            intelReward: intelReward,
            fundingReward: fundingReward,
            supportReward: supportReward,
            fundingPenalty: fundingPenalty,
            supportPenalty: supportPenalty
        );
    }

    public MissionSiteModifiers DeepClone()
        => (MissionSiteModifiers)MemberwiseClone();
}