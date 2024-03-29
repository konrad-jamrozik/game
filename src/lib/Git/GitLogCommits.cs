﻿using System.Collections;
using Lib.Contracts;
using Lib.Primitives;

namespace Lib.Git;

public record GitLogCommits : IEnumerable<GitLogCommit>
{
    private readonly IEnumerable<GitLogCommit> _commits;

    public readonly DaySpan DaySpan;

    public GitLogCommits(IEnumerable<GitLogCommit> commits, DaySpan daySpan)
    {
        _commits = FilterCommits(commits, daySpan);
        DaySpan = daySpan;
    }

    public GitLogCommits(GitLogCommits commits, DaySpan daySpan)
    {
        Contract.Assert(daySpan.IsSubsetOf(commits.DaySpan));
        _commits = FilterCommits(commits, daySpan);
        DaySpan = daySpan;
    }

    public IEnumerator<GitLogCommit> GetEnumerator()
        => _commits.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator()
        => GetEnumerator();

    private static IEnumerable<GitLogCommit> FilterCommits(
        IEnumerable<GitLogCommit> commits,
        DaySpan daySpan)
        => commits.Where(commit => daySpan.Contains(commit.Date));
}