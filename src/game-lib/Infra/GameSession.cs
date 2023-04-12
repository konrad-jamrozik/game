namespace UfoGameLib.Infra;

/// <summary>
/// GameSession represent an instance of a game session (playthrough).
///
/// As such, it maintains a reference to current GameState as well as few most recent states for
/// limited undo capability.
///
/// In addition, it allows updating of the game state by applying PlayerActions.
///
/// GameSession must be accessed directly only by GameSessionController.
/// </summary>
public class GameSession
{
    public GameState CurrentGameState = GameState.NewInitialGameState();

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
        state.UpdateCount = state.UpdateCount++;
        actions.Apply(state);
        return new GameStateUpdateLog();
    }
}