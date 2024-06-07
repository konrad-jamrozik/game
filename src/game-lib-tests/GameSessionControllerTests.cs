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
    public void TurnControllerAdvancesTurns()
    {
        var session = new GameSession2(_randomGen);
        var controller = new GameSessionController2(_config, _log, session);
        var turnController = controller.TurnController;

        int initialTurn = session.CurrentGameState.Timeline.CurrentTurn;

        Assert.That(turnController.CurrentTurn, Is.EqualTo(session.CurrentGameState.Timeline.CurrentTurn));

        // Act
        controller.PlayGameSession(2, new AIPlayer(_log, AIPlayer.Intellect.DoNothing));

        int newTurn = session.CurrentGameState.Timeline.CurrentTurn;

        Contract.Assert(initialTurn + 1 == newTurn);
        Assert.That(turnController.CurrentTurn, Is.EqualTo(session.CurrentGameState.Timeline.CurrentTurn));
    }

    
    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}