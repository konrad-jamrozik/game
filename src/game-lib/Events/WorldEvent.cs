namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public WorldEvent(string type, string details) : base(type, details)
    {
    }
    public override WorldEvent Clone()
        => new(Type, Details);
}