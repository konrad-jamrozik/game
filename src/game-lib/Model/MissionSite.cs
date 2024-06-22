using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Model;

// kja-wishlist add new usage of intel:
// - Investing intel into faction will cause missions from this faction to be generated with better modifiers.

// kja-wishlist add new win criterion:
// - reduce all factions power to 0.

public class MissionSite : IIdentifiable
{
    public int Id { get; }

    public readonly Faction Faction;

    public readonly MissionSiteModifiers Modifiers;
    public readonly int Difficulty;
    public readonly int TurnAppeared;

    public int? TurnDeactivated { get; private set; }
    public bool Expired { get; private set; }

    /// <summary>
    /// How many more times the time can be advanced before the mission site expires.
    /// When ExpiresIn is 0 and the time is advanced, the mission site expires.
    /// </summary>
    public int? ExpiresIn { get; private set; }

    [JsonConstructor]
    public MissionSite(
        int id,
        Faction faction,
        MissionSiteModifiers modifiers,
        int difficulty,
        int turnAppeared,
        int? expiresIn,
        int? turnDeactivated = null,
        bool expired = false)
    {
        Contract.Assert(Difficulty >= 0);
        Contract.Assert(ExpiresIn is null or >= 0);
        Id = id;
        Faction = faction;
        Modifiers = modifiers;
        Difficulty = difficulty;
        TurnAppeared = turnAppeared;
        TurnDeactivated = turnDeactivated;
        Expired = expired;
        ExpiresIn = expiresIn;
        AssertStatusInvariant();
    }

    [JsonIgnore]
    public bool IsActive => TurnDeactivated == null && !Expired && ExpiresIn >= 0;

    [JsonIgnore]
    public bool IsExpired => TurnDeactivated >= 1 && Expired && ExpiresIn == null;

    [JsonIgnore]
    public bool WasLaunched => TurnDeactivated >= 1 && !Expired && ExpiresIn == null;

    [JsonIgnore]
    public int RequiredSurvivingAgentsForSuccess => Ruleset.RequiredSurvivingAgentsForSuccess(this);

    [JsonIgnore]
    public string LogString => $"SiteID: {Id,3}";

    public bool TickExpiration(int turn)
    {
        Contract.Assert(IsActive);
        bool expired = false;
        if (ExpiresIn >= 1)
        {
            ExpiresIn--;
            Contract.Assert(ExpiresIn >= 0);
        }
        else
        {
            Contract.Assert(ExpiresIn == 0);
            Expire(turn);
            expired = true;
        }

        AssertStatusInvariant();
        return expired;
    }

    public void LaunchMission(int turnLaunched)
    {
        Contract.Assert(IsActive);
        ExpiresIn = null;
        TurnDeactivated = turnLaunched;
        AssertStatusInvariant();
    }

    private void Expire(int turnExpired)
    {
        Contract.Assert(IsActive);
        TurnDeactivated = turnExpired;
        ExpiresIn = null;
        Expired = true;
        AssertStatusInvariant();
    }

    private void AssertStatusInvariant()
        => Contract.Assert(IsActive ^ IsExpired ^ WasLaunched);

    public MissionSite DeepClone(Faction clonedFaction)
    {
        return new MissionSite(
            id: Id,
            faction: clonedFaction,
            modifiers: Modifiers.DeepClone(),
            difficulty: Difficulty,
            turnAppeared: TurnAppeared,
            expiresIn: ExpiresIn,
            turnDeactivated: TurnDeactivated,
            expired: Expired);
    }
}