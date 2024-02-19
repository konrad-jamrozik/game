namespace Lib.OS;

public interface IProcess
{
    Task<List<string>> GetStdOutLines();
}