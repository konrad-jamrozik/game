using UfoGameLib.Controller;
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
    public readonly RandomGen RandomGen;
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

    public void ApplyPlayerAction(PlayerAction action)
        => ApplyPlayerActions(action);


    public void ApplyPlayerActions(params PlayerAction[] actionsData)
    {
        PlayerActions actions = new PlayerActions(actionsData);
        GameStateUpdateLog log = UpdateGameState(CurrentGameState, actions);
    }

    private static GameStateUpdateLog UpdateGameState(
        GameState state,
        PlayerActions actions)
    {
        Debug.Assert(!state.IsGameOver);
        actions.Apply(state);
        
        // Currently GameStateUpdateLog is just a stub.
        return new GameStateUpdateLog();
    }
}