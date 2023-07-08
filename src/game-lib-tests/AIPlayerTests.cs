using UfoGameLib.Infra;

namespace UfoGameLib.Tests;

public class AIPlayerTests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public void DoNothingAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.DoNothing);

    [Test]
    public void LaunchMissionsAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.LaunchMissions);

    [Test]
    public void BasicAIPlayerIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.Basic);

    private static void AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect intellect)
    {
        var aiPlayer = new AIPlayer(new GameSessionController(new GameSession()), intellect);

        // Act
        aiPlayer.PlayGameSession();

        // Assert: no exception was thrown and the program didn't loop indefinitely.
    }
}