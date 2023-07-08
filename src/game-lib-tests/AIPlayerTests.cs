using UfoGameLib.Infra;

namespace UfoGameLib.Tests;

public class AIPlayerTests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public void AIPlayerWithDoNothingIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.DoNothing);

    [Test]
    public void AIPlayerWithOnlySendAgentsOnMissionsIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.OnlySendAgentsOnMissions);

    [Test]
    public void AIPlayerWithBasicIntellectPlaysGameUntilConclusion()
        => AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect.Basic);

    private static void AIPlayerPlaysGameUntilConclusion(AIPlayer.Intellect intellect)
    {
        var aiPlayer = new AIPlayer(new GameSessionController(new GameSession()), intellect);

        // Act
        aiPlayer.PlayGameSession();

        // Assert: no exception was thrown and the program didn't loop indefinitely.
    }
}