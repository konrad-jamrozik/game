using System;
using System.Text.Json;
using Lib.Json;
using NUnit.Framework;

namespace Lib.Tests.Json;

// Note this doesn't support tuples. Please see comment on Wikitools.Lib.Json.JsonDiff
public record JsonDiffAssertion(JsonDiff Diff)
{
    // kj2-json this baseline/target is confusing. Should be instead expected/actual.
    public JsonDiffAssertion(object baseline, object target, JsonSerializerOptions? options = null) : this(
        new JsonDiff(baseline, target, options))
    {
    }

    public void Assert()
    {
        NUnit.Framework.Assert.That(
            Diff.IsEmpty,
            Is.True,
            $"The expected baseline is different than the actual target. Diff:{Environment.NewLine}{Diff}");
    }

    public void AssertNotEmpty()
    {
        NUnit.Framework.Assert.That(
            Diff.IsEmpty,
            Is.False,
            $"The expected baseline is the same as the actual target. Diff:{Environment.NewLine}{Diff}");
    }
}