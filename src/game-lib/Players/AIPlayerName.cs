using System.Collections.Immutable;
using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Controller;
using UfoGameLib.Lib;

namespace UfoGameLib.Players;

[JsonConverter(typeof(StringJsonConverter<AIPlayerName>))]
public class AIPlayerName : IEquatable<AIPlayerName>
{
    private static readonly ImmutableList<string> ValidNames = GetValidNames();

    public static readonly AIPlayerName Basic = new AIPlayerName(nameof(BasicAIPlayer));
    public static readonly AIPlayerName DoNothing = new AIPlayerName(nameof(DoNothingAIPlayer));

    private static bool IsValid(string name) => ValidNames.Contains(name);

    private readonly string _name;

    private static ImmutableList<string> GetValidNames()
        => Reflection.GetInterfaceImplementationNames<IAIPlayer>();

    public AIPlayerName(string name)
    {
        Contract.Assert(
            IsValid(name),
            $"The type name '{name}' is not a valid name of AIPlayer-derived class.");
        _name = name;
    }


    public override string ToString()
    {
        return $"{_name}";
    }

    public bool Equals(AIPlayerName? other)
    {
        if (ReferenceEquals(null, other))
            return false;
        if (ReferenceEquals(this, other))
            return true;
        return _name == other._name;
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj))
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        return obj.GetType() == GetType() && Equals((AIPlayerName)obj);
    }

    public override int GetHashCode()
        => _name.GetHashCode();

    public static bool operator ==(AIPlayerName? left, AIPlayerName? right)
        => Equals(left, right);

    public static bool operator !=(AIPlayerName? left, AIPlayerName? right)
        => !Equals(left, right);
}