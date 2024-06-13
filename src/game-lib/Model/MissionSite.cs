using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Model;

// kja add new usage of intel:
// - Investing intel into faction will cause missions from this faction to be generated with better modifiers.

// kja add new win criterion:
// - reduce all factions power to 0.

public class MissionSite : IIdentifiable
{
    public int Id { get; }

    public readonly int Difficulty;
    public readonly int TurnAppeared;

    public int? TurnDeactivated { get; private set; }
    public bool Expired { get; private set; }
    public int? ExpiresIn { get; private set; }

// kja Changes to MissionSite to make:
// - add a Faction reference, serialize it properly via ref
// - add props: DifficultyModifier, RewardAndPenaltyModifiers (money, intel, funding, support),
//     FactionDamageModifier (power, power increase, power acceleration)
// 
// - make Difficulty a computed prop based on DifficultyModifier and Faction.Power
    [JsonConstructor]
    public MissionSite(
        int id,
        int difficulty,
        int turnAppeared,
        int? expiresIn,
        int? turnDeactivated = null,
        bool expired = false)
    {
        Contract.Assert(Difficulty >= 0);
        Contract.Assert(ExpiresIn == null || ExpiresIn >= 0);
        Id = id;
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
        if (ExpiresIn > 0)
            ExpiresIn--;
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

    public MissionSite DeepClone()
    {
        return (MissionSite) MemberwiseClone();
    }
}