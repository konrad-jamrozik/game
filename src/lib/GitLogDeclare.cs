using Lib.Git;
using Lib.OS;
using Lib.Primitives;

namespace Lib;

public class GitLogDeclare
{
    public GitLog GitLog(
        ITimeline timeline,
        IOperatingSystem os,
        Dir gitRepoDir,
        string gitExecutablePath)
    {
        var repo = new GitRepository(
            new GitBashShell(os, gitExecutablePath),
            gitRepoDir
        );
        var gitLog = new GitLog(timeline, repo);
        return gitLog;
    }
}