using UfoGameLib.Controller;
using UfoGameLib.State;

namespace UfoGameLib.Players;

public class DoNothingAIPlayerIntellect : IPlayer
{
    public void PlayGameTurn(GameStatePlayerView state, GameTurnController controller)
    {
        // Do nothing
    }
}