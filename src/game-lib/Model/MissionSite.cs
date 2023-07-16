using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public bool IsActive;

    // kja2 if I remove isActive, will it get deserialized properly?
    [JsonConstructor]
    public MissionSite(int id, bool isActive = true)
    {
        Id = id;
        IsActive = isActive;
    }

    public int Id { get; }
}