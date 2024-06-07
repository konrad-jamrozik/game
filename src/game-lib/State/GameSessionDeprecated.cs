using Lib.Primitives;
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
public class GameSessionDeprecated
{
    public readonly RandomGen RandomGen;

    public GameSessionTurnDeprecated CurrentGameSessionTurn;

    public readonly List<GameSessionTurnDeprecated> PastGameSessionTurns = new List<GameSessionTurnDeprecated>();

    public IReadOnlyList<GameState> PastGameStates
        => PastGameSessionTurns.Select(turn => turn.GameState).ToList().AsReadOnly();

    public GameState CurrentGameState => CurrentGameSessionTurn.GameState;

    public List<GameEvent> CurrentGameEvents => CurrentGameSessionTurn.GameEvents;

    public GameSessionDeprecated(RandomGen randomGen, GameState? currentGameState = null)
    {
        RandomGen = randomGen;
        CurrentGameSessionTurn = new GameSessionTurnDeprecated(currentGameState);
    }

    public List<GameState> AllGameStates => PastGameStates.Concat(CurrentGameState.WrapInList()).ToList();

    public List<GameSessionTurnDeprecated> AllGameSessionTurns => PastGameSessionTurns.Concat(CurrentGameSessionTurn.WrapInList()).ToList();

    public List<GameState> AllGameStatesAtTurnStarts()
        => AllGameStates
            .AtTurnStarts()
            .ToList();

    public GameState? PreviousGameState => PastGameStates.Any() ? PastGameStates.Last() : null;

    public void AppendCurrentTurnToPastTurns()
    {
        // We have to clone the game session turn as the CurrentGameSessionTurn may be mutated downstream.
        // Notably, its game state.
        // Without the cloning, the past game session turn game state would also be mutated as it is the same object.
        PastGameSessionTurns.Add(CurrentGameSessionTurn.Clone());
    }
}