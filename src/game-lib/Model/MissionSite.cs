using Lib.Json;

namespace UfoGameLib.Model;

public class MissionSite : IIdentifiable
{
    public int Id { get; }
    public bool IsActive;

    public MissionSite(int id, bool isActive = true)
    {
        Id = id;
        IsActive = isActive;
    }
}