namespace UfoGameLib.Model;

public static class MissionsExtensions
{
    public static Missions ToMissions(this IEnumerable<Mission> missionsEnumerable)
        => new Missions(missionsEnumerable);
}