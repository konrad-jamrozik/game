namespace UfoGameLib.Events;

public abstract class GameEvent
{
    public readonly int Id;
    public readonly string Type;
    public readonly string Details;

    public GameEvent(int id, string type, string details)
    {
        Id = id;
        Type = type;
        Details = details;
    }

    public abstract GameEvent Clone();
}
