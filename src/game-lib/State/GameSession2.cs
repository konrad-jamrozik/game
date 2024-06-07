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
public class GameSession2
{
    public readonly RandomGen RandomGen;

    public readonly List<GameSessionTurn2> Turns;

    public GameSessionTurn2 CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<GameEvent> CurrentGameEvents => CurrentTurn.EventsInTurn;

    public GameSession2(RandomGen randomGen, List<GameSessionTurn2>? turns = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn2()];
    }

    public IReadOnlyList<GameState> GameStates
        => Turns.SelectMany<GameSessionTurn2, GameState>(turn => [turn.StartState, turn.EndState])
            .ToList()
            .AsReadOnly();
}