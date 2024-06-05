namespace UfoGameLib.Events;

public abstract class GameEvent
{
    public readonly string Type;
    public readonly string Details;

    public GameEvent(string type, string details)
    {
        Type = type;
        Details = details;
    }

    public abstract GameEvent Clone();
}
