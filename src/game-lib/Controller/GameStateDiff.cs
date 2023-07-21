using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

internal class GameStateDiff
{
    private readonly GameState _prev;
    private readonly GameState _curr;

    public GameStateDiff(GameState prev, GameState curr)
    {
        _prev = prev;
        _curr = curr;
    }

    public void PrintTo(ILog log)
    {
        // kja curr work
        log.Info($"Prev turn: {_prev.Timeline.CurrentTurn}");
        log.Info($"Curr turn: {_curr.Timeline.CurrentTurn}");
    }
}