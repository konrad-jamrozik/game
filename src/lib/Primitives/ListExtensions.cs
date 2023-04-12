using System.Collections.Generic;

namespace Lib.Primitives;

public static class ListExtensions
{
    public static IList<TValue> WrapInList<TValue>(this TValue source) => 
        new List<TValue> { source };
}