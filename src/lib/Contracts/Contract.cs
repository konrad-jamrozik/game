using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace Lib.Contracts;

public static class Contract
{
    public static void AssertInRange(
        int subject,
        Range range,
        [CallerArgumentExpression("subject")] string? subjectName = null)
    {
        if (!(subject >= range.Start.Value))
            throw new InvariantException(
                $"{subjectName}: Expected value >= {range.Start.Value}; value = {subject}");
        if (!(subject <= range.End.Value))
            throw new InvariantException(
                $"{subjectName}: Expected value <= {range.End.Value}. value = {subject}. ");
    }

    public static void Assert(
        [DoesNotReturnIf(false)] bool condition,
        [CallerArgumentExpression("condition")]
        string? message = null,
        [CallerMemberName] string? memberName = null)
    {
        if (!condition)
            throw new InvariantException($"Caller: {memberName}(), Failed condition: {message}");
    }

    public static void AssertImplication(
        bool predicate,
        bool condition,
        [CallerArgumentExpression("condition")]
        string? message = null)
    {
        if (predicate)
            Assert(condition, message);
    }

    public static void AssertEqual<T>(IEnumerable<T> first, IEnumerable<T> second)
        where T : IEquatable<T>
    {
        var firstArr = first as T[] ?? first.ToArray();
        var secondArr = second as T[] ?? second.ToArray();
        if (firstArr.Length != secondArr.Length)
            throw new InvariantException();

        firstArr.Zip(secondArr).ToList().ForEach(
            tuple =>
            {
                if (!tuple.First.Equals(tuple.Second))
                    throw new InvariantException();
            });
    }

    /// <summary>
    /// Use this method to make assertions that cannot be easily asserted in code.
    /// Describe them assertions in natural language in "comment" parameter.
    ///
    /// Note that for some simple assertions you could instead use
    /// tautological asserts and quench the ReSharper warning E.g:
    ///
    /// "Values might not be distinct":
    ///   // ReSharper disable once ConditionIsAlwaysTrueOrFalse
    ///   Contract.Assert(values.Distinct().Count() LEQ values.Length);
    ///
    /// "Length might be any positive value":
    ///   // ReSharper disable once ConditionIsAlwaysTrueOrFalse
    ///   Contract.Assert(values.Length GEQ 0);
    /// </summary>
    // ReSharper disable once UnusedParameter.Global
    public static void Assert(string comment)
    {
    }
}