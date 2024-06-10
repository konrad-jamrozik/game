using System.Text.Json.Serialization;

namespace UfoGameLib.Events;

[JsonDerivedType(typeof(MissionSiteExpiredEvent))]
public class WorldEvent : GameEvent
{
    public WorldEvent(int id, string type) : base(id, type)
    {
    }

    public override WorldEvent Clone()
        => new(Id, Type);
}
