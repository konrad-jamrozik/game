using Lib.Contracts;
using Lib.OS;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class GameSessionControllerTests
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
    public void CurrentTurnControllerKeepsTrackOfTheTurn()
    {
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);

        int initialTurn = session.CurrentGameState.Timeline.CurrentTurn;

        Assert.That(controller.CurrentTurnController.CurrentTurn, Is.EqualTo(initialTurn));

        // Act
        controller.PlayGameSession(2, new AIPlayer(_log, AIPlayer.Intellect.DoNothing));

        int nextTurn = session.CurrentGameState.Timeline.CurrentTurn;
        Contract.Assert(initialTurn + 1 == nextTurn);

        Assert.That(controller.CurrentTurnController.CurrentTurn, Is.EqualTo(nextTurn));
    }
    
    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}