using UfoGameLib.Infra;

namespace UfoGameLib;

public class AIPlayer
{
    public enum Intellect
    {
        DoNothing,
        Basic
    }

    private readonly ILog _log;
    private readonly GameSessionController _controller;
    private readonly IAIPlayerIntellect _intellect;

    public AIPlayer(ILog log, GameSessionController controller, Intellect intellect)
    {
        _log = log;
        _controller = controller;
        var intellectMap = new Dictionary<Intellect, IAIPlayerIntellect>
        {
            [Intellect.Basic] = new BasicAIPlayerIntellect(_log),
            [Intellect.DoNothing] = new DoNothingAIPlayerIntellect(),
        };
        _intellect = intellectMap[intellect];
    }

    public void PlayGameSession()
    {
        GameStatePlayerView state = _controller.GameStatePlayerView;

        while (!state.IsGameOver)
        {
            _intellect.PlayGameTurn(state, _controller);

            _controller.AdvanceTime();
        }

        _controller.Save();
    }
}