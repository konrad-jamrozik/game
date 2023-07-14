namespace UfoGameLib.Infra;

public interface ILog : IDisposable
{
    public void Info(string message);
}