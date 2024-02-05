namespace Lib.Json;

/// <summary>
/// This interface is used by GameStateJsonConverter to allow
/// reference-based serialization round-tripping.
/// </summary>
public interface IIdentifiable
{
    public int Id { get; }
}