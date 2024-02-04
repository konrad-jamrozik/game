using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace UfoGameLib.Tests;

public static class PerfTools
{
    public static void MeasureActionRuntime(
        Action targetAction,
        int batchSize,
        [CallerArgumentExpression(parameterName: "targetAction")] string targetActionName = "")
    {
        Console.Out.WriteLine($"Measuring {batchSize} invocations of '${targetActionName}'");
        var stopwatch = Stopwatch.StartNew();

        for (int i = 0; i < batchSize; i++)
        {
            targetAction();
        }

        TimeSpan elapsed = stopwatch.Elapsed;
        Console.Out.WriteLine($"Time taken: {elapsed}. On average: {elapsed / batchSize}");
    }
}