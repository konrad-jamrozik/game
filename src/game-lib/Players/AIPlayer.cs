using UfoGameLib.Controller;
using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Players;

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
        Debug.Assert(_controller.GameStatePlayerView.CurrentTurn == Timeline.InitialTurn);

        var intellectMap = new Dictionary<Intellect, IAIPlayerIntellect>
        {
            [Intellect.Basic] = new BasicAIPlayerIntellect(_log),
            [Intellect.DoNothing] = new DoNothingAIPlayerIntellect(),
        };
        _intellect = intellectMap[intellect];
    }

    public void PlayGameSession(int turnLimit)
    {
        Debug.Assert(turnLimit is >= Timeline.InitialTurn and <= GameState.MaxTurnLimit);
        GameStatePlayerView state = _controller.GameStatePlayerView;

        while (!state.IsGameOver && state.CurrentTurn < turnLimit)
        {
            _intellect.PlayGameTurn(state, _controller);

            _controller.AdvanceTime();
        }

        _log.Info($"Game over! " +
                  $"Game result: {(state.IsGameLost ? "lost" : state.IsGameWon ? "won" : "undecided")}, " +
                  $"money: {state.Assets.Money}, " +
                  $"intel: {state.Assets.Intel}, " +
                  $"funding: {state.Assets.Funding}, " +
                  $"support: {state.Assets.Support}, " +
                  $"turn: {state.CurrentTurn} / {turnLimit}.");

        _controller.Save();
    }
}