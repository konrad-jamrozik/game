using UfoGameLib.Infra;

namespace UfoGameLib;

public class AIPlayer
{
    public enum Intellect
    {
        DoNothing,
        OnlySendAgentsOnMissions,
        Basic
    }

    private readonly IDictionary<Intellect, IAIPlayerIntellect> _intellectMap =
        new Dictionary<Intellect, IAIPlayerIntellect>
        {
            [Intellect.Basic] = new BasicAIPlayerIntellect(),
            [Intellect.OnlySendAgentsOnMissions] = new OnlySendAgentsOnMissionsAIPlayerIntellect(),
            [Intellect.DoNothing] = new DoNothingAIPlayerIntellect(),
        };

    private readonly GameSessionController _controller;

    private readonly IAIPlayerIntellect _intellect;

    public AIPlayer(GameSessionController controller, Intellect intellect)
    {
        _controller = controller;
        _intellect = _intellectMap[intellect];
    }

    public void PlayGameSession()
    {
        GameStatePlayerView state = _controller.GameStatePlayerView;

        while (!state.IsGameOver)
        {
            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {state.CurrentTurn} Current money: {state.Assets.CurrentMoney}");
            
            _intellect.PlayGameTurn(state, _controller);

            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {state.CurrentTurn} DONE");
            
            _controller.AdvanceTime();
        }

        _controller.Save();
    }
}