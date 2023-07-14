using System.Text;

namespace UfoGameLib.Infra;

public class Log : ILog
{
    private readonly Configuration _config;

    private readonly StringBuilder _logs;

    public Log(Configuration config)
    {
        _config = config;
        _logs = new StringBuilder();
        Console.WriteLine($"Created Log with log file path {_config.LogFile.FullPath}");
    }

    public void Info(string message)
    {
        Console.WriteLine(message);
        _logs.AppendLine(message);
    }

    public void Dispose()
    {
        _config.LogFile.WriteAllText(_logs.ToString());
        Console.WriteLine($"Wrote logs to {_config.LogFile.FullPath}");
    }
}