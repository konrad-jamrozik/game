namespace UfoGameLib.Events;

public class PlayerActionEvent : GameEvent
{
    public PlayerActionEvent(string type, string details) : base(type, details)
    {
    }

    public override PlayerActionEvent Clone()
        => new(Type, Details);
}