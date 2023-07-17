using Lib.OS;
using UfoGameLib.Infra;
using UfoGameLib.Players;

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
    public void DoNothingAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.DoNothing);

    [Test]
    public void BasicAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.Basic);

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }

    private void AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect intellect)
    {
        var aiPlayer = new AIPlayer(
            _log,
            new GameSessionController(_config, _log, new GameSession(_log, _randomGen)),
            intellect);

        // Act
        aiPlayer.PlayGameSession(turnLimit: 30);

        // Assert: no exception was thrown and the program didn't loop indefinitely.
    }
}