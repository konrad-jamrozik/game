using System.Collections.Immutable;
using System.Reflection;
using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Lib;

namespace UfoGameLib.Controller;

[JsonConverter(typeof(StringJsonConverter<PlayerActionName>))]
public class PlayerActionName
{
    private static readonly ImmutableList<string> ValidNames = GetValidNames();

    public static bool IsValid(string name) => ValidNames.Contains(name);

    private readonly string _name;

    private static ImmutableList<string> GetValidNames()
        => Reflection.GetDerivedTypeNames<PlayerAction>();

    public PlayerActionName(string name)
    {
        Contract.Assert(
            IsValid(name),
            $"The type name '{name}' is not a valid name of PlayerAction-derived class.");
        _name = name;
    }

    public bool IsNotTimeAdvancement => ToString() != nameof(AdvanceTimePlayerAction);

    public override string ToString()
    {
        return $"{_name}";
    }

    // public static implicit operator string(PlayerActionName playerActionName)
    // {
    //     return playerActionName._name;
    // }
}