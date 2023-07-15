using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public bool IsActive;

    // kja2 if I remove isActive, will it get deserialized properly?
    public MissionSite(int id, bool isActive = true)
    {
        Id = id;
        IsActive = isActive;
    }

    public int Id { get; }
}