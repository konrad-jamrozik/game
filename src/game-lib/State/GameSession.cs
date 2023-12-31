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
    public GameState CurrentGameState = GameState.NewInitialGameState();

    public GameSession(RandomGen randomGen)
    {
        RandomGen = randomGen;
    }

    public GameState? PreviousGameState => PastGameStates.Any() ? PastGameStates.Last() : null;

    public void AddCurrentStateToPastStates()
        => PastGameStates.Add(CurrentGameState.Clone());
}