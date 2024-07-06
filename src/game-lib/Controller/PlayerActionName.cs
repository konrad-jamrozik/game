using System.Collections.Immutable;
using System.Reflection;
using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Events;

namespace UfoGameLib.Controller;

[JsonConverter(typeof(StringJsonConverter<PlayerActionName>))]
public class PlayerActionName
{
    private readonly string _name;

    private static readonly ImmutableList<string> ValidNames = GetValidNames();

    private static ImmutableList<string> GetValidNames()
    {
        // Get the assembly that contains the PlayerAction class
        Assembly assembly = Assembly.GetAssembly(typeof(PlayerAction))!;

        // Get all types in the assembly that inherit from PlayerAction
        var derivedTypes = assembly.GetTypes().Where(t => t.IsSubclassOf(typeof(PlayerAction)));

        return derivedTypes.Select(t => t.Name).ToImmutableList();
    }

    public PlayerActionName(string name)
    {
        Contract.Assert(
            ValidNames.Contains(name),
            $"The type name '{name}' is not a valid name of PlayerAction-derived class.");
        _name = name;
    }

    public bool IsNotTimeAdvancement => ToString() != GameEventType.AdvanceTimePlayerAction;

    public override string ToString()
    {
        return $"{_name}";
    }

    // public static implicit operator string(PlayerActionName playerActionName)
    // {
    //     return playerActionName._name;
    // }
}