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

    public MissionSites Active => this.Where(missionSite => missionSite.IsActive).ToMissionSites();

    public MissionSites Launched => this.Where(missionSite => missionSite.WasLaunched).ToMissionSites();

    public MissionSites Expired => this.Where(missionSite => missionSite.IsExpired).ToMissionSites();
}