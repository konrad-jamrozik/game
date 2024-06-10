namespace UfoGameLib.Events;

public class PlayerActionEvent : GameEvent
{
    public PlayerActionEvent(int id, string type, string details) : base(id, type, details)
    {
        // kja assert that type is one of the valid PlayerActions
    }

    public override PlayerActionEvent Clone()
        => new(Id, Type, Details);
}