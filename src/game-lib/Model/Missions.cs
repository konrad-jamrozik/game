using Newtonsoft.Json;

namespace UfoGameLib.Model;

public class Missions : List<Mission>
{
    [JsonConstructor]
    public Missions()
    {
    }

    public Missions(IEnumerable<Mission>? missions = null)
        => AddRange(missions ?? new List<Mission>());

    public List<Mission> Active => this.Where(mission => mission.IsActive).ToList();

    public List<Mission> Successful => this.Where(mission => mission.IsSuccessful).ToList();

    public List<Mission> Failed => this.Where(mission => mission.IsFailed).ToList();
}