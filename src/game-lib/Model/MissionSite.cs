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
    public readonly int Difficulty;
    public readonly int TurnAppeared;

    public int? TurnDeactivated { get; private set; }
    public bool Expired { get; private set; }
    public int? ExpiresIn { get; private set; }

// kja-wishlist Changes to MissionSite to make:
// - add a Faction reference, serialize it properly via ref
// - add props: DifficultyModifier, RewardAndPenaltyModifiers (money, intel, funding, support),
//     FactionDamageModifier (power, power increase, power acceleration)
// 
// - make Difficulty a computed prop based on DifficultyModifier and Faction.Power
    [JsonConstructor]
    public MissionSite(
        int id,
        Faction faction,
        int difficulty,
        int turnAppeared,
        int? expiresIn,
        int? turnDeactivated = null,
        bool expired = false)
    {
        Contract.Assert(Difficulty >= 0);
        Contract.Assert(ExpiresIn == null || ExpiresIn >= 0);
        Id = id;
        Faction = faction;
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
            // kja note: this may tick ExpiresIn down to 0 and yet not expire.
            // This looks nice in UI (Mission expires in ZERO turns) but is inconsistent with
            // things like Faction.MissionSiteCountdown where if it reaches zero, it immediately generates a mission site.
            //
            // Perhaps the definition of Faction.MissionSiteCountdown should align with ExpiresIn counting.
            // So change it from
            // "The number of times the time must be advanced for a new mission site to be generated."
            // to 
            // "The number of times the time can be advanced before a mission site will be generated."
            // Once I do that, I must update the comment with a table in:
            // Faction.CreateMissionSites
            ExpiresIn--;
        }
        else
        {
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
            difficulty: Difficulty,
            turnAppeared: TurnAppeared,
            expiresIn: ExpiresIn,
            turnDeactivated: TurnDeactivated,
            expired: Expired);
    }
}