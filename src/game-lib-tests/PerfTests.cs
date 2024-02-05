using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class PerfTests
{    
    // Relevant doc:
    // https://github.com/dotnet/performance/blob/main/docs/microbenchmark-design-guidelines.md
    [Test]
    public void MeasurePerfOfGameStateClone()
    {
        GameState gs = GameStateFixtures.Get();

        int batchSize = 100;
        PerfTools.MeasureActionRuntime(() => gs.Clone(useJsonSerialization: true), batchSize);
        PerfTools.MeasureActionRuntime(() => gs.Clone(useJsonSerialization: false), batchSize);
    }
}