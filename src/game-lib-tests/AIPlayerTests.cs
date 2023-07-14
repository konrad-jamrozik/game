using Lib.OS;
using UfoGameLib.Infra;

namespace UfoGameLib.Tests;

public class AIPlayerTests
{
    private Configuration _config = null!;
    private ILog _log = null!;

    [SetUp]
    public void Setup()
    {
        _config = new Configuration(new FileSystem());
        _log = new Log(_config);
    }


    [Test]
    public void DoNothingAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.DoNothing);

    [Test]
    public void BasicAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.Basic);

    private void AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect intellect)
    {
        var aiPlayer = new AIPlayer(_log, new GameSessionController(_config, _log, new GameSession(_log)), intellect);

        // Act
        aiPlayer.PlayGameSession();

        // Assert: no exception was thrown and the program didn't loop indefinitely.
    }

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}