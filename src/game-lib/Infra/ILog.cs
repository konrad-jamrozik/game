using System.Runtime.CompilerServices;

namespace UfoGameLib.Infra;

public interface ILog : IDisposable
{
    public void Info(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null);
}