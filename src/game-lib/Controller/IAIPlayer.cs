using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public interface IAIPlayer
{
    public void PlayGameTurn(GameStatePlayerView state, GameTurnController controller);

    public static IAIPlayer New(ILog log, AIPlayerName name)
    {
        var playerMap = new Dictionary<AIPlayerName, IAIPlayer>
        {
            [AIPlayerName.Basic] = new BasicAIPlayer(log),
            [AIPlayerName.DoNothing] = new DoNothingAIPlayer(),
        };
        return playerMap[name];
    }
}