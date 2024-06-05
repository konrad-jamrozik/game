using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

// kja address TODOs in all ctors of PlayerAction inheritors
public abstract class PlayerAction
{
    public PlayerActionEvent Apply(GameState state)
    {
        Contract.Assert(!state.IsGameOver, 
            $"money: {state.Assets.Money} " +
            $"funding: {state.Assets.Funding} " +
            $"support: {state.Assets.Support}");

        PlayerActionEvent playerActionEvent = ApplyImpl(state);
        // This UpdateCount is tricky, because sometimes given action can do multiple operations,
        // for example, 10 agents can be hired by invoking "Hire agents" action 10 times with 1 agent,
        // 5 times with 2 agents or 1 time with 10 agents.
        state.UpdateCount += 1;

        if (this is not AdvanceTimePlayerAction)
        {
            Contract.Assert(
                !state.IsGameOver,
                $"money: {state.Assets.Money} " +
                $"funding: {state.Assets.Funding} " +
                $"support: {state.Assets.Support}");
        }

        return playerActionEvent;

    }
    protected abstract PlayerActionEvent ApplyImpl(GameState state);

}