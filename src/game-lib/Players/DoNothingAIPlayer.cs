using UfoGameLib.Controller;
using UfoGameLib.State;

namespace UfoGameLib.Players;

public class DoNothingAIPlayer : IAIPlayer
{
    public void PlayGameTurn(GameStatePlayerView state, GameTurnController controller)
    {
        // Do nothing
    }
}