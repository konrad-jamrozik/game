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

    public static int TransportCapacityBuyingCost(int capacity)
        => capacity * 200;
}