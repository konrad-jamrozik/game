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