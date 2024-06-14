using System.Text.Json.Serialization;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Model;

public class Factions : List<Faction>
{
    [JsonConstructor]
    public Factions()
    {
    }

    public Factions(IEnumerable<Faction>? factions = null)
        => AddRange(factions ?? new List<Faction>());

    public Factions DeepClone()
        => new Factions(this.Select(faction => faction.DeepClone()));

    public List<MissionSite> CreateMissionSites(
        ILog log,
        IRandomGen randomGen,
        MissionSiteIdGen missionSiteIdGen,
        GameState state)
        => this.SelectMany(faction => faction.CreateMissionSites(log, randomGen, missionSiteIdGen, state)).ToList();
}