// ReSharper disable MemberCanBePrivate.Global
// Reason: public fields are being serialized to JSON.

using System.Text.Json.Serialization;
using Lib.Contracts;

namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public readonly List<int>? Ids;
    public readonly int? TargetId;

    public WorldEvent(int id, string type, List<int>? ids = null, int? targetId = null) : this(
        id,
        new GameEventType(type),
        ids,
        targetId)
    {
    }

    [JsonConstructor]
    public WorldEvent(int id, GameEventType type, List<int>? ids = null, int? targetId = null) : base(id, type)
    {
        Contract.Assert(GameEventType.IsValidWorldEventType(type.ToString()));
        Ids = ids;
        TargetId = targetId;
    }

    public override WorldEvent Clone()
        => new(Id, Type, Ids, TargetId);
}
