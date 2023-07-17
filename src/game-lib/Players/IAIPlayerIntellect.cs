using UfoGameLib.Infra;

namespace UfoGameLib.Players;

public interface IAIPlayerIntellect
{
    public void PlayGameTurn(GameStatePlayerView state, GameSessionController controller);
}