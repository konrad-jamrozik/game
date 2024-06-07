using UfoGameLib.Events;

namespace UfoGameLib.State;

public class GameSessionTurnDeprecated
{
    public readonly GameState GameState;
    public readonly List<GameEvent> GameEvents;

    public GameSessionTurnDeprecated(GameState? gameState = null, List<GameEvent>? gameEvents = null)
    {
        GameState = gameState ?? GameState.NewInitialGameState();
        GameEvents = gameEvents ?? new List<GameEvent>();
    }

    public GameSessionTurnDeprecated Clone()
        => DeepClone();

    private GameSessionTurnDeprecated DeepClone()
        => new(
            GameState.Clone(),
            GameEvents.Select(gameEvent => gameEvent.Clone()).ToList()
        );
}