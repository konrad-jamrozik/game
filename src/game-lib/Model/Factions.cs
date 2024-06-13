using System.Text.Json.Serialization;

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
}