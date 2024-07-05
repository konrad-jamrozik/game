using Lib.Contracts;
using System.Reflection;
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

        (List<int>? ids, int? targetId) = ApplyImpl(state);
        // This UpdateCount is tricky, because sometimes given action can do multiple operations,
        // for example, 10 agents can be hired by invoking "Hire agents" action 10 times with 1 agent,
        // 5 times with 2 agents or 1 time with 10 agents.
        state.UpdateCount += 1;
        state.AssertInvariants();

        Contract.Assert(
            !state.IsGameOver,
            $"money: {state.Assets.Money} " +
            $"funding: {state.Assets.Funding} " +
            $"support: {state.Assets.Support}");

        return new PlayerActionEvent(nextEventId, GetType().Name, ids, targetId);

    }
    protected abstract (List<int>? ids, int? targetId) ApplyImpl(GameState state);

    public static void ValidateName(string name)
    {
        bool isValid = IsValidName(name);
        Contract.Assert(isValid, $"The type name '{name}' is not a valid name of PlayerAction-derived class.");
    }

    public static bool IsValidName(string name)
    {
        // Get the assembly that contains the PlayerAction class
        Assembly assembly = Assembly.GetAssembly(typeof(PlayerAction))!;
        
        // Get all types in the assembly that inherit from PlayerAction
        var derivedTypes = assembly.GetTypes().Where(t => t.IsSubclassOf(typeof(PlayerAction)));

        // Check if the provided typeName matches any derived type's name
        bool isValid = derivedTypes.Any(t => t.Name == name);
        return isValid;
    }
}
