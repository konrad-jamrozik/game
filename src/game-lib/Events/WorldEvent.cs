namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public WorldEvent(int id, string type, string details) : base(id, type, details)
    {
    }

    public override WorldEvent Clone()
        => new(Id, Type, Details);
}