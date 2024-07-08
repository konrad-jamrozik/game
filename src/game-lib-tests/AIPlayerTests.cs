using Lib.OS;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class AIPlayerTests
{
    private Configuration _config = null!;
    private ILog _log = null!;
    private readonly IRandomGen _randomGen = new RandomGen();

    [SetUp]
    public void Setup()
    {
        _config = new Configuration(new FileSystem());
        _log = new Log(_config);
    }

    [Test]
    public void Scratchpad()
    {
        // List<int> foo = new List<int> { 1, 2, 3, 4, 5, 6, 7 };
        // List<int> taken = foo[^7..]; // Works in .NET 8 only
        // for (int i = 0; i < taken.Count; i++)
        // {
        //     Console.Out.WriteLine($"i {i}: {taken[i]}");
        // }
    }

    [Test]
    public void DoNothingAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayerName.DoNothing, turnLimit: 10);

    [Test]
    public void BasicAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayerName.Basic, turnLimit: 100);

    [Test]
    public void ExampleGameSessionForApi()
    {
        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var randomGen = new RandomGen();
        var aiPlayerName = AIPlayerName.Basic;
        var controller = new GameSessionController(config, log, new GameSession(randomGen));
        var aiPlayer = IAIPlayer.New(log, aiPlayerName);

        // Act
        controller.PlayGameSession(turnLimit: 30, aiPlayer);
    }

    [Test]
    [Ignore("Long-running test (15+ sec)")]
    public void RunSimulations()
    {
        // future work: run this test in a way where no save games or logs are produced except the final log of
        // "game over", for every single simulation run.
        // Also, as each game session progresses, no GameStates in it should be kept except the current one.
        for (int i = 0; i < 100; i++)
        {
            AIPlayerPlaysGameUntilConclusion(AIPlayerName.Basic, turnLimit: 300);    
        }
    }

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }

    private void AIPlayerPlaysGameUntilConclusion(AIPlayerName name, int turnLimit)
    {
        var controller = new GameSessionController(_config, _log, new GameSession(_randomGen));
        var aiPlayer = IAIPlayer.New(_log, name);

        // Act
        controller.PlayGameSession(turnLimit, aiPlayer);

        // Assert: no exception was thrown and the program didn't loop indefinitely.

        Console.Out.WriteLine($"Last turn: {controller.CurrentGameStatePlayerView.CurrentTurn}");
    }
}