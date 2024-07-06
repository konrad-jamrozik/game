using Lib.Json;

namespace UfoGameLib.Events;

public abstract class GameEvent : IIdentifiable
{
    public int Id { get; }
    public readonly GameEventType Type;

    public GameEvent(int id, string type) : this(id, new GameEventType(type))
    {
    }

    public GameEvent(int id, GameEventType type)
    {
        Id = id;
        Type = type;
    }


    public abstract GameEvent Clone();
}