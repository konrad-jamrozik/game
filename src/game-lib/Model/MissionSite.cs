using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public readonly int Difficulty;
    public readonly int TurnAppeared;

    [JsonConstructor]
    public MissionSite(
        int id,
        int difficulty,
        int turnAppeared,
        int? expiresIn,
        int? turnDeactivated = null,
        bool expired = false)
    {
        Debug.Assert(Difficulty >= 0);
        Debug.Assert(ExpiresIn == null || ExpiresIn >= 0);
        Id = id;
        Difficulty = difficulty;
        TurnAppeared = turnAppeared;
        TurnDeactivated = turnDeactivated;
        Expired = expired;
        ExpiresIn = expiresIn;
        AssertStatusInvariant();
    }

    public int? TurnDeactivated { get; private set; }
    public bool Expired { get; private set; }
    public int? ExpiresIn { get; private set; }

    [JsonIgnore]
    public bool IsActive => TurnDeactivated == null && !Expired && ExpiresIn >= 0;

    [JsonIgnore]
    public bool IsExpired => TurnDeactivated >= 1 && Expired && ExpiresIn == null;

    [JsonIgnore]
    public bool WasLaunched => TurnDeactivated >= 1 && !Expired && ExpiresIn == null;

    [JsonIgnore]
    public int RequiredSurvivingAgentsForSuccess => Ruleset.RequiredSurvivingAgentsForSuccess(this);

    public int Id { get; }

    [JsonIgnore]
    public string LogString => $"SiteID: {Id,3}";

    public bool TickExpiration(int turn)
    {
        Debug.Assert(IsActive);
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
        Debug.Assert(IsActive);
        ExpiresIn = null;
        TurnDeactivated = turnLaunched;
        AssertStatusInvariant();
    }

    private void Expire(int turnExpired)
    {
        Debug.Assert(IsActive);
        TurnDeactivated = turnExpired;
        ExpiresIn = null;
        Expired = true;
        AssertStatusInvariant();
    }

    private void AssertStatusInvariant()
        => Debug.Assert(IsActive ^ IsExpired ^ WasLaunched);
}