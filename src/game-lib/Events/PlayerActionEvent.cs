namespace UfoGameLib.Events;

public class PlayerActionEvent : GameEvent
{
    public PlayerActionEvent(int id, string type, string details) : base(id, type, details)
    {
    }

    public override PlayerActionEvent Clone()
        => new(Id, Type, Details);
}