using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Tests;

public static class FactionFixtures
{
    public static Factions SingleFaction(IRandomGen randomGen) => new(
    [
        // Note: need to ensure here that IDs are consecutive, and from zero.
        Faction.Init(randomGen, id: 0, "Black Lotus cult", power: 200, powerClimb: 5),
    ]);
}
