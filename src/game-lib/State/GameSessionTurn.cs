using UfoGameLib.Events;

namespace UfoGameLib.State;

// kja to be more intuitive each turn could have two states:
// 1. At the beginning of player turn 
//   and, if applicable, the Advance Time player event and all WorldEvent leading up to it from previous turn
// 2. At the end of player turn
//   and, if applicable, all player action events leading up to it from the turn start.
//
// Initial GameSessionTurn (turn 1) for new GameSession:
// - (A) Previous advance time and world events: null
// - (B) State at turn start: initial game state:
// - (C) Player action events: null
// - (D) State at turn end: exact copy of state at turn start
//
// Player makes action in turn, like hire agents:
//
// 1. Take initial GameSessionTurn (turn 1) and do the following:
// - Modify the state at turn end (D) to reflect the player action
// - Append the player action event to the list of player action events (C)
//
// Player advances turn:
// 1. "Seal" the existing turn - it gets added to "previous turns" collection in immutable state
// 2. Create a new GameSessionTurn (turn 2) with the following:
//   - (A) Previous advance time and world events: null
//   - (B) State at turn start: initial game state: copy of (D) from the previous turn
//   - (C) Player action events: null
//   - (D) State at turn end: null
// 3. Append "Advance time" player action to (A)
// 4. Evaluate the time advancement by modifying state (B) and appending World Events to (A)
// 5. Copy state (B) to (D)
// 6. Now the GameSessionTurn for turn 2 looks like this:
//   - (A) Previous advance time and world events: Advance time from turn 1 to 2 and a list of world events
//   - (B) State at turn start: game state that was the result of (A) applied to (D) from turn 1
//   - (C) Player action events: null
//   - (D) State at turn end: exact copy of (B)
//
// Properties of game session turn:
// Initial? If (A) is null
// Current (if and only if Mutable; if and only if Active)? If last in game session turns list
//
// Resetting turns means deleting (C) and overwriting (D) with (B)
// Reverting turn means deleting entire GameSessionTurn and treating (D) from previous turn as current state.

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