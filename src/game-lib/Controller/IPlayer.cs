using UfoGameLib.State;

namespace UfoGameLib.Controller;

public interface IPlayer
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller);
}