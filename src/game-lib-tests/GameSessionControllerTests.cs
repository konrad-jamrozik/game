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
    private readonly RandomGen _randomGen = new RandomGen(new Random());

    [SetUp]
    public void Setup()
    {
        _config = new Configuration(new FileSystem());
        _log = new Log(_config);
    }

    [Test]
    public void CurrentTurnControllerKeepsTrackOfTheTurn()
    {
        var session = new GameSession2(_randomGen);
        var controller = new GameSessionController2(_config, _log, session);

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