using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public readonly int Difficulty;
    public bool IsActive;

    [JsonConstructor]
    public MissionSite(int id, int difficulty)
    {
        Id = id;
        IsActive = true;
        Difficulty = difficulty;
    }

    public int Id { get; }
}