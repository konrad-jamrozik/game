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

    public MissionSiteModifiers DeepClone()
        => (MissionSiteModifiers)MemberwiseClone();
}
