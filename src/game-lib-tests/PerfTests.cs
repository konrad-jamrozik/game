using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class PerfTests
{    
    // Relevant doc:
    // https://github.com/dotnet/performance/blob/main/docs/microbenchmark-design-guidelines.md
    [Test]
    public void MeasurePerfOfGameStateClone()
    {
        // kja curr work
        // rename clone to JsonClone
        // implement proper OO clone
        // do comparative perf. measurements

        GameState gs = GameStateFixtures.Get();

        PerfTools.MeasureActionRuntime(() => gs.Clone(), batchSize: 100);

        // kja implement deep clone. See https://learn.microsoft.com/en-us/dotnet/api/system.object.memberwiseclone?view=net-8.0#remarks
        PerfTools.MeasureActionRuntime(() => gs.Clone(useJsonSerialization: false), batchSize: 100);
    }
}