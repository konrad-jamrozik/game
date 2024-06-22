namespace UfoGameLib.Model;

// kja Changes to MissionSite to make:
// - add props for (money, intel, funding, support), both reward if won and penalty if lost or expired.
// - add props for: faction damage: reduction of (power, power increase, power acceleration), if mission won
public record MissionSiteModifiers
{
    private readonly int _moneyReward;
    private readonly int _intelReward;
    private readonly int _fundingReward;
    private readonly int _supportReward;
    private readonly int _powerDamageReward;
    private readonly int _powerIncreaseDamageReward;
    private readonly int _powerAccelerationDamageReward;
    private readonly int _fundingPenalty;
    private readonly int _supportPenalty;

    public MissionSiteModifiers(
        int? moneyReward = null,
        int? intelReward = null,
        int? fundingReward = null,
        int? supportReward = null,
        int? powerDamageReward = null,
        int? powerIncreaseDamageReward = null,
        int? powerAccelerationDamageReward = null,
        int? fundingPenalty = null,
        int? supportPenalty = null)
    {
        _moneyReward = moneyReward ?? 0;
        _intelReward = intelReward ?? 0;
        _fundingReward = fundingReward ?? 0;
        _supportReward = supportReward ?? 0;
        _powerDamageReward = powerDamageReward ?? 0;
        _powerIncreaseDamageReward = powerIncreaseDamageReward ?? 0;
        _powerAccelerationDamageReward = powerAccelerationDamageReward ?? 0;
        _fundingPenalty = fundingPenalty ?? 0;
        _supportPenalty = supportPenalty ?? 0;
    }
}