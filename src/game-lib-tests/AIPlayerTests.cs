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
    private readonly RandomGen _randomGen = new RandomGen(new Random());

    [SetUp]
    public void Setup()
    {
        _config = new Configuration(new FileSystem());
        _log = new Log(_config);
    }

    [Test]
    public void Scratchpad()
    {
        List<int> foo = new List<int> { 1, 2, 3, 4, 5, 6, 7 };
        List<int> taken = foo[^7..];
        for (int i = 0; i < taken.Count; i++)
        {
            Console.Out.WriteLine($"i {i}: {taken[i]}");
        }
    }

    [Test]
    public void DoNothingAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.DoNothing, turnLimit: 5);

    [Test]
    public void BasicAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.Basic, turnLimit: 30);

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }

    private void AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect intellect, int turnLimit)
    {
        var controller = new GameSessionController(_config, _log, new GameSession(_randomGen));
        var aiPlayer = new AIPlayer(_log, intellect);

        // Act
        controller.PlayGameSession(turnLimit, aiPlayer);

        // Assert: no exception was thrown and the program didn't loop indefinitely.
    }
}