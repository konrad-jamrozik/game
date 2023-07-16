using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public MissionSite Site;
    public bool IsActive;

    public Mission(int id, MissionSite site)
    {
        Debug.Assert(site.IsActive);

        Id = id;
        Site = site;
        // MissionSite is no longer active because this mission was launched on it.
        Site.IsActive = false;
        // This mission just got constructed so it is active until it gets evaluated
        // on time advancement.
        IsActive = true;
    }

    [JsonConstructor]
    public Mission(int id, bool isActive, MissionSite site)
    {
        Id = id;
        Site = site;
        IsActive = isActive;
    }

    public int Id { get; }
}
