using UfoGameLib.Controller;
using UfoGameLib.State;

namespace UfoGameLib.Players;

public interface IAIPlayerIntellect
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller);
}