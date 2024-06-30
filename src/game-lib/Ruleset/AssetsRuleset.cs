using Lib.Contracts;
using UfoGameLib.Model;

namespace UfoGameLib.Ruleset;

public static class AssetsRuleset
{
    public const int InitialMoney = 500;
    public const int InitialIntel = 0;
    public const int InitialFunding = 20;
    public const int InitialSupport = 30;
    public const int InitialMaxTransportCapacity = 4;

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
        int incomeGenerated = assets.Agents.GeneratingIncome.Count * AgentsRuleset.IncomeGeneratedPerAgent();
        int moneyRewardFromMissions = successfulMissions.Sum(mission => mission.Site.Modifiers.MoneyReward);

        return funding + incomeGenerated + moneyRewardFromMissions - agentUpkeep;
    }

    public static int ComputeIntelChange(Assets assets, List<Mission> successfulMissions)
    {
        int intelGathered = assets.Agents.GatheringIntel.Count * AgentsRuleset.IntelGatheredPerAgent();
        int intelFromMissions = successfulMissions.Sum(mission => mission.Site.Modifiers.IntelReward);
        return intelGathered + intelFromMissions;
    }

    /// <summary>
    /// The way this formula is set up, one gets discount for buying transport capacity in bulk.
    ///
    /// For example, assume:
    ///
    ///   maxTransportCap == InitialMaxTransportCapacity
    /// 
    /// Now consider:
    ///
    /// Scenario A:
    /// Buy 1 price: 200 * 1 = 200
    /// Buy 1 price: 250 * 1 = 250
    /// Buy 1 price: 300 * 1 = 300
    /// Buy 1 price: 350 * 1 = 350
    /// Total: 1100 = 200 + 250 + 300 + 350
    ///
    /// Scenario B:
    /// Buy 2 price: 200 * 2 = 400
    /// Buy 2 price: 300 * 2 = 600
    /// Total: 1000 = 400 + 600
    ///
    /// Scenario C:
    /// Buy 4 price: 200 * 4 = 800
    /// Total: 800 = 800
    /// 
    /// </summary>
    public static int TransportCapacityBuyingCost(int maxTransportCap, int capacityToBuy)
    {
        Contract.Assert(maxTransportCap >= InitialMaxTransportCapacity);
        Contract.Assert(capacityToBuy >= 1);
        return (200 + (50 * (maxTransportCap - InitialMaxTransportCapacity))) * capacityToBuy;
    }
}