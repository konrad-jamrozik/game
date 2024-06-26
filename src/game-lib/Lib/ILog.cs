using System.Runtime.CompilerServices;

namespace UfoGameLib.Lib;

public interface ILog : IDisposable
{
    public void Debug(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null);

    public void Info(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null);

    public void Flush();
}