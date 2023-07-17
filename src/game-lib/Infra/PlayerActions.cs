namespace UfoGameLib.Infra;

public class PlayerActions : List<PlayerAction>
{
    public PlayerActions(IEnumerable<PlayerAction> actions) : base(actions)
    {
    }

    public void Apply(GameState state)
    {
        ForEach(action =>
        {
            action.Apply(state);
            // This UpdateCount is tricky, because sometimes given action can do multiple operations,
            // for example, 10 agents can be hired by invoking "Hire agents" action 10 times with 1 agent,
            // 5 times with 2 agents or 1 time with 10 agents.
            state.UpdateCount += 1;
        });
    }
}