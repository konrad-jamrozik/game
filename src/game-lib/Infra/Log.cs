namespace UfoGameLib.Infra;

public class Log : ILog
{
    private Configuration _config;

    public Log(Configuration config)
    {
        _config = config;
    }

    public void Info(string message)
    {
        Console.WriteLine(message);
    }
}