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
    private readonly IDictionary<Intellect, IAIPlayerIntellect> _intellectMap;
    private readonly IAIPlayerIntellect _intellect;

    public AIPlayer(ILog log, GameSessionController controller, Intellect intellect)
    {
        _log = log;
        _controller = controller;
        _intellectMap =
            new Dictionary<Intellect, IAIPlayerIntellect>
            {
                [Intellect.Basic] = new BasicAIPlayerIntellect(_log),
                [Intellect.DoNothing] = new DoNothingAIPlayerIntellect(),
            };
        _intellect = _intellectMap[intellect];
    }

    public void PlayGameSession()
    {
        GameStatePlayerView state = _controller.GameStatePlayerView;

        while (!state.IsGameOver)
        {
            _log.Info(
                $"----- AIPlayer Current turn: {state.CurrentTurn} Current money: {state.Assets.CurrentMoney}");

            _intellect.PlayGameTurn(state, _controller);

            _log.Info(
                $"----- AIPlayer Current turn: {state.CurrentTurn} DONE");

            _controller.AdvanceTime();
        }

        _controller.Save();
    }
}