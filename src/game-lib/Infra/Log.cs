using System.Runtime.CompilerServices;
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

    public void Dispose()
    {
        _config.LogFile.WriteAllText(_logs.ToString());
        Console.WriteLine($"Wrote logs to {_config.LogFile.FullPath}");
    }

    public void Info(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null)

    {
        // Based on https://stackoverflow.com/a/45512962/986533

        string log = LogPrefix(callerFilePath, callerMemberName) + message;
        Console.WriteLine(log);
        _logs.AppendLine(log);
    }

    private string LogPrefix(string? callerFilePath, string? callerMemberName)
    {
        string logPrefix = "";
        switch (_config)
        {
            case { IncludeCallerTypeNameInLog: true, IncludeCallerMemberNameInLog: true }:
            {
                var callerTypeName = Path.GetFileNameWithoutExtension(callerFilePath);
                logPrefix = $"{callerTypeName}.{callerMemberName}: ";
                break;
            }
            case { IncludeCallerTypeNameInLog: true, IncludeCallerMemberNameInLog: false }:
            {
                var callerTypeName = Path.GetFileNameWithoutExtension(callerFilePath);
                logPrefix = $"{callerTypeName}: ";
                break;
            }
            case { IncludeCallerTypeNameInLog: false, IncludeCallerMemberNameInLog: true }:
                logPrefix = $"{callerMemberName}: ";
                break;
        }

        return logPrefix;
    }
}