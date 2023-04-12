namespace Lib.OS;

public interface IOperatingSystem
{
    IProcess Process(string executableFilePath, Dir workingDir, params string[] arguments);
}