using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Ruleset;

public static class FactionsRuleset
{
    public static readonly Range FactionMissionSiteCountdownRange = new Range(3, 10);

    // For more example factions data, see:
    // https://github.com/konrad-jamrozik/game/blob/eccb44a1d5f074e95b07aebca2c6bc5bbfdfdda8/src/ufo-game/Model/Data/FactionsData.cs#L34
    public static Factions InitFactions(IRandomGen randomGen) => new(
    [
        // Note: need to ensure here that IDs are consecutive, and from zero.
        Faction.Init(randomGen, id: 0, "Black Lotus cult", power: 20, powerClimb: 0.4, powerAcceleration: 0.008),
        Faction.Init(randomGen, id: 1, "Red Dawn remnants", power: 30, powerClimb: 0.5, powerAcceleration: 0.005),
        Faction.Init(randomGen, id: 2, "EXALT", power: 40, powerClimb: 0.6, powerAcceleration: 0.004),
        Faction.Init(randomGen, id: 3, "Zombies", power: 10, powerClimb: 0.1, powerAcceleration: 0.02)
    ]);
}