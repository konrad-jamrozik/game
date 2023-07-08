using UfoGameLib.Infra;

namespace UfoGameLib;

public abstract class AbstractAIPlayer
{
    private readonly GameSessionController _controller;

    protected AbstractAIPlayer(GameSessionController controller)
    {
        _controller = controller;
    }

    public void PlayGameSession()
    {
        GameStatePlayerView gameStateView = _controller.GameStatePlayerView;

        while (!gameStateView.IsGameOver)
        {
            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {gameStateView.CurrentTurn} Current money: {gameStateView.Assets.CurrentMoney}");
            
            PlayGameTurn(_controller);

            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {gameStateView.CurrentTurn} DONE");
            
            _controller.AdvanceTime();
        }

        _controller.Save();
    }

    protected abstract void PlayGameTurn(GameSessionController controller);
}