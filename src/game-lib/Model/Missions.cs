namespace UfoGameLib.Model;

public class Missions : List<Mission>
{
    public Missions(IEnumerable<Mission>? missions = null)
        => AddRange(missions ?? new List<Mission>());
}