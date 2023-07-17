using UfoGameLib.Infra;

namespace UfoGameLib.Players;

public class DoNothingAIPlayerIntellect : IAIPlayerIntellect
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller)
    {
        // Do nothing
    }
}