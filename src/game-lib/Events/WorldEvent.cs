// ReSharper disable MemberCanBePrivate.Global
// Reason: public fields are being serialized to JSON.
namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public readonly List<int>? Ids;
    public readonly int? TargetId;

    public WorldEvent(int id, string type, List<int>? ids = null, int? targetId = null) : base(id, type)
    {
        Ids = ids;
        TargetId = targetId;    
        // kja2-assert: that 'type' is one of the valid WorldEvents
    }

    public override WorldEvent Clone()
        => new(Id, Type, Ids, TargetId);
}
