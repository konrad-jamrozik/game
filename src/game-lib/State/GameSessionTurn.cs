using UfoGameLib.Events;

namespace UfoGameLib.State;

// kja to be more intuitive each turn could have two states:
// 1. At the beginning of player turn 
//   and, if applicable, the Advance Time player event and all WorldEvent leading up to it from previous turn
// 2. At the end of player turn
//   and, if applicable, all player action events leading up to it from the turn start.
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