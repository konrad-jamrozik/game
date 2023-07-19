using Lib.Primitives;

namespace UfoGameLib.Model;

public static class MissionSitesExtensions
{
    public static MissionSites ToMissionSites(this IEnumerable<MissionSite> missionSitesEnumerable)
        => new MissionSites(missionSitesEnumerable);

    public static MissionSites ToMissionSites(this MissionSite missionSite)
        => new MissionSites(missionSite.WrapInList());
}