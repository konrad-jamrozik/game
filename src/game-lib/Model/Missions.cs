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

    public Missions DeepClone(MissionSites clonedMissionSites)
    {
        return new Missions(this.Select(mission =>
        {
            // kja (fixed already, but need to add assertions) getting "more than one elem" here on BasicAIPlayer plays game test.
            // This denotes issue with busted site IDs with the new mission generation logic
            // Root cause identified: see UfoGameLib.Model.Faction.CreateMissionSites
            //
            // This dup key issue was not immediately caught, and I got in UI two mission sited with ID "1".
            // Only next turn errored with Error: "An item with the same key has already been added. Key: 1"
            MissionSite clonedMissionSite = clonedMissionSites.Single(clonedSite => clonedSite.Id == mission.Site.Id);
            return mission.DeepClone(clonedMissionSite);
        }));
    }
}