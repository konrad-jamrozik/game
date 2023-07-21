using System.Runtime.CompilerServices;
using System.Text;
using UfoGameLib.Controller;

namespace UfoGameLib.Lib;

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

    public void Info(
        string message,
        [CallerFilePath] string? callerFilePath = null,
        [CallerMemberName] string? callerMemberName = null)
    {
        // kja temp disable logs except GameStateDiff
        if (!callerFilePath!.Contains(nameof(GameStateDiff)))
            return;

        string log = LogPrefix(callerFilePath, callerMemberName) + message;
        Console.WriteLine(log);
        _logs.AppendLine(log);
    }

    public void Dispose()
    {
        _config.LogFile.WriteAllText(_logs.ToString());
        Console.WriteLine($"Wrote logs to {_config.LogFile.FullPath}");
    }

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

// kja3 Logged info could be significantly improved, like this:
// A game state is snapshotted at following points:
// A) Player is just starting their turn; basically _intellect.PlayGameTurn
// B) Turn is about to be processed; basically _controller.AdvanceTime();
// Note that A) for turn N is the same as "Turn finished processing" but for turn N-1.
//
// The log/report would be displaying Diff between A) and B),
// aka "player decisions diff" and then B) and A) aka "turn eval. diff"
// Both diffs could have tables, e.g. agent table, where each row corresponds to an agent,
// and says things like:
// - for player decisions diff:
//   - how the agent state state changed, e.g. from InTraining to OnMission
// - for turn eval. diff:
//   - how the agent fared on mission: wounds sustained, enemies killed, experience gained
//   - how the agent improved in training, recovered, or how much intel gathered
//
// The benefit of such snapshot diff is that data can be easily derived, and post-processed
// instead of having to log just-in-time, like e.g. player decision to send an agent to mission.