using UfoGameLib.Events;

namespace UfoGameLib.State;

public class GameSessionTurn
{
    public readonly GameState GameState;
    public readonly List<GameEvent> GameEvents;

    public GameSessionTurn(GameState? gameState = null, List<GameEvent>? gameEvents = null)
    {
        GameState = gameState ?? GameState.NewInitialGameState();
        GameEvents = gameEvents ?? new List<GameEvent>();
    }

    public GameSessionTurn Clone()
        => DeepClone();

    private GameSessionTurn DeepClone()
        => new(
            GameState.Clone(),
            GameEvents.Select(gameEvent => gameEvent.Clone()).ToList()
        );
}