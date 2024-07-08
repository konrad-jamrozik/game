using System.Collections.Immutable;
using System.Reflection;

namespace UfoGameLib.Lib;

public static class Reflection
{
    public static ImmutableList<string> GetDerivedTypeNames<T>()
    {
        Assembly assembly = Assembly.GetAssembly(typeof(T))!;

        var derivedTypes = assembly.GetTypes().Where(t => t.IsSubclassOf(typeof(T)));

        return derivedTypes.Select(t => t.Name).ToImmutableList();
    }

    public static ImmutableList<string> GetInterfaceImplementationNames<T>()
    {
        Assembly assembly = Assembly.GetAssembly(typeof(T))!;

        var derivedTypes = assembly.GetTypes().Where(t => typeof(T).IsAssignableFrom(t));

        return derivedTypes.Select(t => t.Name).ToImmutableList();
    }
}