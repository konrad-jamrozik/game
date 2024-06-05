namespace Lib.Primitives;

public static class ListExtensions
{
    public static List<TValue> WrapInList<TValue>(this TValue source) => 
        new List<TValue> { source };
}