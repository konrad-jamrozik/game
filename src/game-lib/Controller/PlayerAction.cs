using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public abstract class PlayerAction
{
    public PlayerActionEvent Apply(GameState state, int nextEventId)
    {
        Contract.Assert(!state.IsGameOver,
            $"money: {state.Assets.Money} " +
            $"funding: {state.Assets.Funding} " +
            $"support: {state.Assets.Support}");

        string applyResultDetails = ApplyImpl(state);
        // This UpdateCount is tricky, because sometimes given action can do multiple operations,
        // for example, 10 agents can be hired by invoking "Hire agents" action 10 times with 1 agent,
        // 5 times with 2 agents or 1 time with 10 agents.
        state.UpdateCount += 1;

        Contract.Assert(
            !state.IsGameOver,
            $"money: {state.Assets.Money} " +
            $"funding: {state.Assets.Funding} " +
            $"support: {state.Assets.Support}");

        return new PlayerActionEvent(nextEventId, GetType().Name, applyResultDetails);

    }
    protected abstract string ApplyImpl(GameState state);

}
