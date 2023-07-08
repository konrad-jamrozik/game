using UfoGameLib.Infra;

namespace UfoGameLib;

public interface IAIPlayerIntellect
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller);
}