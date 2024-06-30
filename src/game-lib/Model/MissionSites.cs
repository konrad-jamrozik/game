using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class MissionSites : List<MissionSite>
{
    [JsonConstructor]
    public MissionSites()
    {
    }

    public MissionSites(IEnumerable<MissionSite>? missionSites = null)
        => AddRange(missionSites ?? new List<MissionSite>());

    public MissionSites DeepClone(Factions clonedFactions)
    {
        return new MissionSites(this.Select(missionSite =>
        {
            Faction clonedFaction = clonedFactions.Single(clonedFaction => clonedFaction.Id == missionSite.Faction.Id);
            return missionSite.DeepClone(clonedFaction);
        }));
    }

    public MissionSites Active => this.Where(missionSite => missionSite.IsActive).ToMissionSites();

    public MissionSites Launched => this.Where(missionSite => missionSite.WasLaunched).ToMissionSites();

    public MissionSites Expired => this.Where(missionSite => missionSite.IsExpired).ToMissionSites();

    public MissionSites ActiveOrdByDifficultyDesc => Active.OrderByDescending(site => site.Difficulty).ToMissionSites();

}