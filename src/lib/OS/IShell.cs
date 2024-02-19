namespace Lib.OS;

public interface IShell
{
    Task<List<string>> GetStdOutLines(Dir workingDir, string[] arguments);
}