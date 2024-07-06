// ReSharper disable MemberCanBePrivate.Global
// Reason: public fields are being serialized to JSON.

using System.Text.Json.Serialization;
using Lib.Contracts;

namespace UfoGameLib.Events;

public class PlayerActionEvent : GameEvent
{
    public readonly List<int>? Ids;
    public readonly int? TargetId;

    public PlayerActionEvent(int id, string type, List<int>? ids = null, int? targetId = null) : this(
        id,
        new GameEventType(type),
        ids,
        targetId)
    {
    }

    [JsonConstructor]
    public PlayerActionEvent(int id, GameEventType type, List<int>? ids = null, int? targetId = null) : base(id, type)
    {
        Contract.Assert(GameEventType.IsValidPlayerActionEvent(type.ToString()));
        Ids = ids;
        TargetId = targetId;
    }

    public override PlayerActionEvent Clone()
        => new(Id, Type, Ids, TargetId);
}