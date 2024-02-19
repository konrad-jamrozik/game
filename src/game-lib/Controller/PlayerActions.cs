using Lib.Contracts;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class PlayerActions : List<PlayerAction>
{
    public PlayerActions(IEnumerable<PlayerAction> actions) : base(actions)
    {
    }

    public static void Apply(PlayerAction action, GameState state)
        => new PlayerActions(new[] { action }).Apply(state);

    public GameStateUpdateLog Apply(GameState state)
    {
        Contract.Assert(!state.IsGameOver, 
            $"money: {state.Assets.Money} " +
            $"funding: {state.Assets.Funding} " +
            $"support: {state.Assets.Support}");
        ForEach(action =>
        {
            action.Apply(state);
            // This UpdateCount is tricky, because sometimes given action can do multiple operations,
            // for example, 10 agents can be hired by invoking "Hire agents" action 10 times with 1 agent,
            // 5 times with 2 agents or 1 time with 10 agents.
            state.UpdateCount += 1;
            if (action is not AdvanceTimePlayerAction)
            {
                Contract.Assert(!state.IsGameOver, 
                    $"money: {state.Assets.Money} " +
                    $"funding: {state.Assets.Funding} " +
                    $"support: {state.Assets.Support}");
            }
        });

        // Currently GameStateUpdateLog is just a stub.
        return new GameStateUpdateLog();
    }
}