using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public readonly int Difficulty;
    public bool IsActive;
    public int ExpiresIn;

    [JsonConstructor]
    public MissionSite(int id, int difficulty, int expiresIn)
    {
        Debug.Assert(Difficulty >= 0);
        Debug.Assert(ExpiresIn >= 0);
        Id = id;
        IsActive = true;
        Difficulty = difficulty;
        ExpiresIn = expiresIn;
    }

    [JsonIgnore]
    public bool IsExpired => !IsActive && ExpiresIn == 0;

    public int Id { get; }
}