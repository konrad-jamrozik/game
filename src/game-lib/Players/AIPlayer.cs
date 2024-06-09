using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Players;

public class AIPlayer : IPlayer
{
    // kja2-test need to add intellect that tries to lose the game on 3rd turn.
    public enum Intellect
    {
        DoNothing,
        Basic
    }

    private readonly IPlayer _intellect;

    public AIPlayer(ILog log, Intellect intellect)
    {
        var intellectMap = new Dictionary<Intellect, IPlayer>
        {
            [Intellect.Basic] = new BasicAIPlayerIntellect(log),
            [Intellect.DoNothing] = new DoNothingAIPlayerIntellect(),
        };
        _intellect = intellectMap[intellect];
    }


    public void PlayGameTurn(GameStatePlayerView state, GameTurnController controller)
        => _intellect.PlayGameTurn(state, controller);
}