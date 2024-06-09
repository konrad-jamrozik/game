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
        GameEvent? firstGameEvent = Turns.SelectMany(turn => turn.GameEvents).FirstOrDefault();
        // kja this will not work if game has no events
        // If there are no events, the offset will be zero and event IDs will count from 0.
        // If there is at least one event:
        //   If the first event has ID of 0 then the offset will remain zero, and the 
        //   standard way of counting event IDs by summing their number applies.
        //   If the first event has ID > 0, e.g. 1, then the offset will be 1.
        //   For example, if there are 3 events and offset is 1, then existing events have IDs:
        //   [1,2,3] and the 4th event will get ID of Count([,1,2,3]) + 1 = 4, as expected.
        _eventIdOffset = firstGameEvent?.Id ?? 0;
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