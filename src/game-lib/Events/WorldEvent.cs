namespace UfoGameLib.Events;

public class WorldEvent : GameEvent
{
    public WorldEvent(int id, string type) : base(id, type)
    {
    }

    public override WorldEvent Clone()
        => new(Id, Type);
}