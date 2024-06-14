using Lib.Json;

namespace UfoGameLib.Events;

public abstract class GameEvent : IIdentifiable
{
    public int Id { get; }
    public readonly string Type;

    public GameEvent(int id, string type)
    {
        Id = id;
        Type = type;
    }

    public abstract GameEvent Clone();
}
