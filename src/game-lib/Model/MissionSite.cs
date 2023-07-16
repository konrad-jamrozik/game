using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public bool IsActive;

    [JsonConstructor]
    public MissionSite(int id)
    {
        Id = id;
        IsActive = true;
    }

    public int Id { get; }
}