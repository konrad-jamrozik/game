using Lib.OS;

namespace Lib.Git;

public record GitRepository(GitBashShell GitBashShell, Dir WorkingDir)
{
    public Task<List<string>> GetStdOutLines(string gitCmdLine) 
        => GitBashShell.GetStdOutLines(WorkingDir, new[] {gitCmdLine});
}