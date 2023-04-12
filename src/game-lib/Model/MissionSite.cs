namespace UfoGameLib.Model;

public class MissionSite
{
    public readonly int Id;
    public bool IsActive;

    public MissionSite(int id, bool isActive = true)
    {
        Id = id;
        IsActive = isActive;
    }
}