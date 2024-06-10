// ReSharper disable MemberCanBePrivate.Global
// Reason: public fields are being serialized and sent over the wire as part of GameSessionTurn
// being given as input to ApiUtils.ToJsonHttpResult.
namespace UfoGameLib.Events;

public class PlayerActionEvent : GameEvent
{
    public readonly List<int>? Ids;
    public readonly int? TargetId;

    public PlayerActionEvent(int id, string type, List<int>? ids = null, int? targetId = null) : base(id, type)
    {
        Ids = ids;
        TargetId = targetId;
        // kja2-assert: that 'type' is one of the valid PlayerActions.
    }

    public override PlayerActionEvent Clone()
        => new(Id, Type, Ids, TargetId);
}