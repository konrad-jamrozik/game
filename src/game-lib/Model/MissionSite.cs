using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public readonly int Difficulty;
    public readonly int TurnAppeared;
    public bool IsActive;
    public int? ExpiresIn { get; private set; }
    public int? TurnExpired { get; private set; }

    // ReSharper disable once IntroduceOptionalParameters.Global
    public MissionSite(int id, int turnAppeared, int difficulty, int expiresIn) : this(
        id,
        turnAppeared,
        difficulty,
        expiresIn,
        turnExpired: null)
    {
    }

    [JsonConstructor]
    public MissionSite(int id, int turnAppeared, int difficulty, int? expiresIn, int? turnExpired)
    {
        Debug.Assert(Difficulty >= 0);
        Debug.Assert(ExpiresIn == null || ExpiresIn >= 0);
        Id = id;
        TurnAppeared = turnAppeared;
        IsActive = true;
        Difficulty = difficulty;
        ExpiresIn = expiresIn;
        TurnExpired = turnExpired;
    }

    [JsonIgnore]
    public bool IsExpired => !IsActive && ExpiresIn == null;
    
    // kja use this everywhere instead of Ruleset.RequiredSurvivingAgentsForSuccess
    [JsonIgnore]
    public int RequiredSurvivingAgentsForSuccess => Ruleset.RequiredSurvivingAgentsForSuccess(this);

    public int Id { get; }

    [JsonIgnore]
    public string LogString => $"SiteID: {Id,3}";

    public bool TickExpiration(int turn)
    {
        Debug.Assert(IsActive && ExpiresIn >= 0);
        bool expired = false;
        if (ExpiresIn > 0)
            ExpiresIn--;
        else
        {
            Expire(turn);
            expired = true;
        }

        return expired;
    }

    private void Expire(int turnExpired)
    {
        Debug.Assert(IsActive && ExpiresIn == 0);
        IsActive = false;
        TurnExpired = turnExpired;
    }
}