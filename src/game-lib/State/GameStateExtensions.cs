namespace UfoGameLib.State;

public static class GameStateExtensions
{
    /// <summary>
    /// This method requires for the input 'gameStates' to be states from given
    /// game session, ordered chronologically, from some time interval,
    /// without gaps (i.e. missing states in-between).
    ///
    /// This method returns only game states at the beginning of each turn, meaning,
    /// every other state, starting from the very initial one So states at index 0, 2, 4, 6 and so on.
    /// This is because such states are the beginning of a turn after, in the previous turn [1],
    /// the player made their actions *AND* advanced the turn timer.
    ///
    /// [1] Of course, the gameStates[0] state is assumed to be initial state with no previous turn.
    /// </summary>
    /// <param name="gameStates"></param>
    /// <returns></returns>
    public static GameState[] AtTurnStarts(this IEnumerable<GameState> gameStates)
        => gameStates.Where((_, i) => (i % 2 == 0)).ToArray();

}