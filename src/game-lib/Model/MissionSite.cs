using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public bool IsActive;

    public MissionSite(int id, bool isActive = true)
    {
        Id = id;
        IsActive = isActive;
    }

    public int Id { get; }
}