namespace UfoGameLib.Model;

public static class FactionsExtensions
{
    public static Factions ToFactions(this IEnumerable<Faction> factionsEnumerable) 
        => new Factions(factionsEnumerable);
}