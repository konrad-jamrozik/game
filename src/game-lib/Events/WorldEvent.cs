using System.Text.Json.Serialization;

namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public readonly int TargetId;

    public WorldEvent(int id, string type, int targetId) : base(id, type)
    {
        TargetId = targetId;    
    }

    public override WorldEvent Clone()
        => new(Id, Type, TargetId);
}
