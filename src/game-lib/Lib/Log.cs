using System.Runtime.CompilerServices;
using System.Text;

namespace UfoGameLib.Lib;

public class Log : ILog
{
    private readonly Configuration _config;

    private readonly StringBuilder _logs;

    public Log(Configuration config)
    {
        _config = config;
        _logs = new StringBuilder();
        if (_config.LogLevel != "silent")
            LogInternal($"Logs will be written out to file path {_config.LogFile.FullPath}");
    }

    public void Debug(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null)
    {
        if (_config.LogLevel != "debug")
            return;

        LogInternal(message, callerFilePath, callerMemberName);
    }

    public void Info(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null)
    {
        if (!((string[])["debug", "info"]).Contains(_config.LogLevel))
            return;

        LogInternal(message, callerFilePath, callerMemberName);
    }

    private void LogInternal(
        string message,
        string? callerFilePath = null,
        string? callerMemberName = null)
    {
        string log = LogPrefix(callerFilePath, callerMemberName) + message;
        Console.WriteLine(log);
        _logs.AppendLine(log);
    }

    public void Flush()
    {
        if (_config.LogLevel == "silent")
            return;

        if (_logs.Length > 0)
        {
            _config.LogFile.WriteAllText(_logs.ToString());
            Console.WriteLine($"Wrote logs to {_config.LogFile.FullPath}");
            _logs.Clear();
        }
    }

    public void Dispose()
        => Flush();

    private string LogPrefix(string? callerFilePath, string? callerMemberName)
    {
        return _config switch
        {
            { IncludeCallerTypeNameInLog: true, IncludeCallerMemberNameInLog: true }
                => $"{CallerTypeName()}.{callerMemberName}: ",

            { IncludeCallerTypeNameInLog: true, IncludeCallerMemberNameInLog: false }
                => $"{CallerTypeName()}: ",

            { IncludeCallerTypeNameInLog: false, IncludeCallerMemberNameInLog: true }
                => $"{callerMemberName}: ",

            _ => ""
        };

        // Based on https://stackoverflow.com/a/45512962/986533
        string? CallerTypeName()
            => Path.GetFileNameWithoutExtension(callerFilePath);
    }
}