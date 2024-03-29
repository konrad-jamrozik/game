using Lib.Primitives;
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

    public readonly List<GameState> PastGameStates = new List<GameState>();
    public GameState CurrentGameState;

    public GameSession(RandomGen randomGen, GameState? currentGameState = null)
    {
        RandomGen = randomGen;
        CurrentGameState = currentGameState ?? GameState.NewInitialGameState();
    }

    public List<GameState> AllGameStates => PastGameStates.Concat(CurrentGameState.WrapInList()).ToList();

    public List<GameState> AllGameStatesAtTurnStarts()
        => AllGameStates
            .AtTurnStarts()
            .ToList();

    public GameState? PreviousGameState => PastGameStates.Any() ? PastGameStates.Last() : null;

    public void AppendCurrentStateToPastStates()
    {
        // We have to clone the game state as the CurrentGameState may be mutated downstream.
        // Without the cloning, the past game state would also be mutated as it is the same object.
        PastGameStates.Add(CurrentGameState.Clone());
    }
}