namespace UfoGameLib.Events;

public abstract class GameEvent
{
    public readonly int Id;
    public readonly string Type;

    public GameEvent(int id, string type)
    {
        Id = id;
        Type = type;
    }

    public abstract GameEvent Clone();
}
