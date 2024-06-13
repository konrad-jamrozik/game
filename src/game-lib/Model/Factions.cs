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

    public List<MissionSite> CreateMissionSites(ILog log, RandomGen randomGen, GameState state)
        => this.SelectMany(faction => faction.CreateMissionSites(log, randomGen, state)).ToList();
}