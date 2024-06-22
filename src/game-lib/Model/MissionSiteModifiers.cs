using System.Text.Json.Serialization;

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

    public MissionSiteModifiers DeepClone()
        => (MissionSiteModifiers)MemberwiseClone();
}