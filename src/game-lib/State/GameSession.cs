using Lib.Contracts;
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

    public GameSessionTurn CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<PlayerActionEvent> CurrentPlayerActionEvents => CurrentTurn.EventsInTurn;

    public readonly EventIdGen EventIdGen;

    public GameSession(RandomGen randomGen, List<GameSessionTurn>? turns = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn(startState: GameState.NewInitialGameState())];
        Contract.Assert(Turns.Count >= 1);
        Turns.ForEach(turn => turn.AssertInvariants());
        EventIdGen = new EventIdGen(Turns);
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