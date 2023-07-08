using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib.Tests;

public class GameSessionTests
{
    [SetUp]
    public void Setup()
    {
    }

    // kja3 overall work plan:
    // implement first AIPlayer
    //
    // reimplement a bit more logic
    //   start by adding new capabilities to AIPlayer (as if it tried to do a new thing) and implement going from there.
    //
    // implement IPersistable
    //   write unit tests confirming it works
    //
    // implement IResettable
    //   write unit tests confirming it works
    //
    // implement ITemporal
    //   write unit tests confirming it works
    //
    // generate CLI interface based on available PlayerActions and contents of GameState
    //
    // generate API Controller methods for REST API generation
    //
    // deploy the game server with REST API locally
    //
    // deploy the game server with REST API to Azure
    //
    // generate swagger UI from the controller methods
    //
    // when available, interface with the swagger UI via LLM, or with CLI by using GH CLI Copilot
    //
    // Test strategy:
    // - One basic happy path test, showcasing concrete steps how player could interact with the API,
    // via usage of player simulator.
    // - Smart player simulators, actually playing the game, designed in a way to exercise its features.
    //   - Such simulators will exercise all of the game logic by design, and I could add assertions checking
    //     if given feature was used at least once during the simulated run.
    //   - Game sessions executed by these players will be captured as unit tests, by fixing appropriate
    //     random seed and letting the simulator play.
    // - All code augmented with strong suite of invariants: preconditions, postconditions, assertions.
    //   - This, coupled with the smart player simulations, ensures test failure on invariant violation.

    [Test]
    public void BasicHappyPathGameSessionWorks()
    {
        var session = new GameSession();
        var controller = new GameSessionController(session);

        GameState startingGameState = session.CurrentGameState;

        Assert.Multiple(
            () =>
            {
                Assert.That(startingGameState.Timeline.CurrentTurn, Is.EqualTo(1));
                Assert.That(startingGameState.Assets.Agents, Has.Count.EqualTo(0));
                Assert.That(startingGameState.Missions, Has.Count.EqualTo(0));
            });

        // Act
        controller.HireAgents(count: 3);
        controller.AdvanceTime();
        controller.AdvanceTime();
        MissionSite site = controller.GameStatePlayerView.MissionSites.First();
        controller.LaunchMission(site, agentCount: 3);
        controller.AdvanceTime();

        var finalGameState = session.CurrentGameState;

        Assert.Multiple(() => {
            Assert.That(finalGameState.Timeline.CurrentTurn, Is.EqualTo(4), "currentTurn");
            Assert.That(finalGameState.Assets.Agents, Has.Count.EqualTo(3), "agentsHiredCount");
            Assert.That(finalGameState.Missions, Has.Count.EqualTo(1), "missionsLaunchedCount");

            Assert.That(
                startingGameState,
                Is.EqualTo(finalGameState),
                "starting state should be equal to final state");
            Assert.That(startingGameState.Assets.Agents, Is.EqualTo(finalGameState.Assets.Agents));
            Assert.That(startingGameState.Missions, Is.EqualTo(finalGameState.Missions));
        });
    }

    [Test]
    public void LoadingPreviousGameStateOverridesCurrentState()
    {
        var session = new GameSession();
        var controller = new GameSessionController(session);

        int savedTurn = controller.GameStatePlayerView.CurrentTurn;
        GameState startingGameState = session.CurrentGameState;

        // Act 1/2
        controller.Save();

        controller.AdvanceTime();
        
        Assert.That(controller.GameStatePlayerView.CurrentTurn, Is.EqualTo(savedTurn + 1), "savedTurn+1");
        
        // Act 2/2
        GameState loadedGameState = controller.Load();

        Assert.That(loadedGameState, Is.EqualTo(session.CurrentGameState));
        Assert.That(loadedGameState, Is.Not.EqualTo(startingGameState));
        Assert.That(controller.GameStatePlayerView.CurrentTurn, Is.EqualTo(savedTurn), "savedTurn");
        Assert.That(
            startingGameState,
            Is.Not.EqualTo(loadedGameState),
            "starting state should not be equal to final state");
    }

    /// <summary>
    /// Given:
    ///   A non-trivial game state
    /// When:
    ///   That game state is saved and then loaded, a.k.a. round-tripped.
    /// Then:
    ///   - The resulting game state is the same as before saving
    ///   - and no duplicate instance objects have been deserialized.
    /// </summary>
    [Test]
    public void RoundTrippingSavingAndLoadingGameStateBehavesCorrectly()
    {
        var session = new GameSession();
        var controller = new GameSessionController(session);

        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.HireAgents(3);
        
        controller.LaunchMission(controller.GameStatePlayerView.MissionSites.First(), agentCount: 1);
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();

        // Act 1 and 2
        controller.Save();
        controller.Load();

        var gameStateView = controller.GameStatePlayerView;
        Assert.That(gameStateView.CurrentTurn, Is.EqualTo(7));
        Assert.That(gameStateView.Assets.Agents, Has.Count.EqualTo(3));
        Assert.That(gameStateView.Missions, Has.Count.EqualTo(1));
        Assert.That(gameStateView.MissionSites, Has.Count.EqualTo(2));

        // Test the references have been preserved,
        // i.e. no duplicate object instances have been introduced.
        Assert.That(
            gameStateView.Missions[0].Site, 
            Is.SameAs(gameStateView.MissionSites[0]));
    }

}