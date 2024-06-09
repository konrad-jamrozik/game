using Lib.Contracts;
using Lib.Primitives;
using MoreLinq;
using UfoGameLib.Events;
using UfoGameLib.Lib;

namespace UfoGameLib.State;

/// <summary>
/// GameSession represents an instance of a game session (a playthrough).
///
/// As such, it maintains a reference to current GameState.
///
/// In addition, it allows updating of the game state by applying PlayerActions.
///
/// GameSession must be accessed directly only by GameSessionController.
/// </summary>
public class GameSession
{
    public readonly RandomGen RandomGen;

    public readonly List<GameSessionTurn> Turns;

    public int NextEventId => GameEvents.Count + _eventIdOffset;

    public GameSessionTurn CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<PlayerActionEvent> CurrentPlayerActionEvents => CurrentTurn.EventsInTurn;

    private readonly int _eventIdOffset;

    public GameSession(RandomGen randomGen, List<GameSessionTurn>? turns = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn(startState: GameState.NewInitialGameState())];
        Contract.Assert(Turns.Count >= 1);
        Turns.ForEach(turn => turn.AssertInvariants());

        // To compute event ID offset we first need to determine if there are any events in the input
        // game session turns. If yes, we consider as offset the event ID of the first event.
        // If not, we consider as offset the NextEventId of the last turn, if set.
        // Otherwise, we assume no offset, meaning it is equal to zero.
        //
        // Notably we must rely on last turn NextEventID when calling REST API to advance turn
        // from a turn that has no events. This may happen e.g. when advancing from turn 1 to 2
        // when player action made no actions.
        // In such case:
        // - There will be no "before turn" world events, as this is the first turn.
        // - There will be no events in the turn, as the player did nothing.
        // - There will be no "advance turn" event, as the player is advancing turn just right now.
        GameEvent? firstGameEvent = Turns.SelectMany(turn => turn.GameEvents).FirstOrDefault();
        _eventIdOffset = firstGameEvent?.Id ?? Turns.Last().NextEventId ?? 0;
    }

    public IReadOnlyList<GameState> GameStates
        => Turns.SelectMany<GameSessionTurn, GameState>(turn => [turn.StartState, turn.EndState])
            .ToList()
            .AsReadOnly();

    public IReadOnlyList<GameEvent> GameEvents
        => Turns.SelectMany<GameSessionTurn, GameEvent>(turn => turn.GameEvents)
            .ToList()
            .AsReadOnly();
}