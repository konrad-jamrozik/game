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

    public GameSessionTurn CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<GameEvent> CurrentGameEvents => CurrentTurn.EventsInTurn;

    public GameSession(RandomGen randomGen, List<GameSessionTurn>? turns = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn()];
    }

    public IReadOnlyList<GameState> GameStates
        => Turns.SelectMany<GameSessionTurn, GameState>(turn => [turn.StartState, turn.EndState])
            .ToList()
            .AsReadOnly();
}