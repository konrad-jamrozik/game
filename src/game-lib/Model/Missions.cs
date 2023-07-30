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

    public Missions Active => this.Where(mission => mission.IsActive).ToMissions();

    public Missions Successful => this.Where(mission => mission.IsSuccessful).ToMissions();

    public Missions Failed => this.Where(mission => mission.IsFailed).ToMissions();

    public Missions Launched => this.Where(mission => mission.WasLaunched).ToMissions();
}