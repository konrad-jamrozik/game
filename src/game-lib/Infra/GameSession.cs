using UfoGameLib.Lib;

namespace UfoGameLib.Infra;

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
    public readonly RandomGen RandomGen; // kja is it even needed here? Same for log, and this entire class.
    public GameState CurrentGameState = GameState.NewInitialGameState();

    // Populated when CurrentGameState is overridden, e.g. because it got
    // loaded from a save file.
    public GameState? PreviousGameState = null;

    private ILog Log;

    public GameSession(ILog log, RandomGen randomGen)
    {
        Log = log;
        RandomGen = randomGen;
    }
}