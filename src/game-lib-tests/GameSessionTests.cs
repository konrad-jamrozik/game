using Lib.OS;
using Lib.Tests.Json;
using UfoGameLib.Controller;
using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Tests;

public class GameSessionTests
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
        var session = new GameSession(_log, _randomGen);
        var controller = new GameSessionController(_config, _log, session);

        GameState startingState = session.CurrentGameState;

        Assert.Multiple(
            () =>
            {
                Assert.That(startingState.Timeline.CurrentTurn, Is.EqualTo(1));
                Assert.That(startingState.Assets.Agents, Has.Count.EqualTo(0));
                Assert.That(startingState.Missions, Has.Count.EqualTo(0));
            });

        // Act
        controller.HireAgents(count: 3);
        controller.AdvanceTime();
        controller.AdvanceTime();
        MissionSite site = controller.GameStatePlayerView.MissionSites.First();
        controller.LaunchMission(site, agentCount: 3);
        controller.AdvanceTime();

        var finalState = session.CurrentGameState;

        Assert.Multiple(() => {
            Assert.That(finalState.Timeline.CurrentTurn, Is.EqualTo(4), "currentTurn");
            Assert.That(
                finalState.Assets.Agents.Count + finalState.TerminatedAgents.Count,
                Is.EqualTo(3),
                "agentsHiredCount");
            Assert.That(finalState.Missions, Has.Count.EqualTo(1), "missionsLaunchedCount");

            Assert.That(
                startingState,
                Is.EqualTo(finalState),
                "starting state should be equal to final state");
            Assert.That(startingState.Assets.Agents, Is.EqualTo(finalState.Assets.Agents));
            Assert.That(startingState.Missions, Is.EqualTo(finalState.Missions));
        });
    }

    [Test]
    public void LoadingPreviousGameStateOverridesCurrentState()
    {
        var session = new GameSession(_log, _randomGen);
        var controller = new GameSessionController(_config, _log, session);

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
    ///   And the game state has active mission.
    /// Then:
    ///   - The resulting loaded game state is the same as before saving
    ///   - and no duplicate instance objects have been introduced
    ///     during serialization (saving) or deserialization (loading).
    /// </summary>
    [Test]
    public void RoundTrippingSavingAndLoadingGameStateWithActiveMissionBehavesCorrectly()
    {
        var session = new GameSession(_log, _randomGen);
        var controller = new GameSessionController(_config, _log, session);

        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.HireAgents(5);
        // Need to advance time here so that hired agents are no longer InTransit and can be
        // sent on a mission.
        controller.AdvanceTime();

        controller.SackAgent(id: 0);

        controller.LaunchMission(
            controller.GameStatePlayerView.MissionSites.First(),
            agentCount: 3);

        // Act 1/2 and 2/2
        controller.Save();
        controller.Load();

        // Assume: session.PreviousGameState has game state as saved.
        // Assume: session.CurrentGameState has game state as loaded.
        // Assert that the GameState is the same after loading
        new JsonDiffAssertion(
                session.PreviousGameState!,
                session.CurrentGameState,
                GameSessionController.SaveJsonSerializerOptions)
            .Assert();
    }

    /// <summary>
    /// Given:
    ///   A non-trivial game state
    /// When:
    ///   That game state is saved and then loaded, a.k.a. round-tripped.
    /// Then:
    ///   - The resulting loaded game state is the same as before saving
    ///   - and no duplicate instance objects have been introduced
    ///     during serialization (saving) or deserialization (loading)
    ///   - and some properties have values exactly as expected.
    /// </summary>
    [Test]
    public void RoundTrippingSavingAndLoadingGameStateBehavesCorrectly()
    {
        var session = new GameSession(_log, _randomGen);
        var controller = new GameSessionController(_config, _log, session);

        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.HireAgents(10);
        // Need to advance time here so that hired agents are no longer InTransit and can be
        // sent on a mission.
        controller.AdvanceTime();

        controller.LaunchMission(
            controller.GameStatePlayerView.MissionSites.First(),
            agentCount: controller.GameStatePlayerView.Assets.CurrentTransportCapacity);

        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();

        // Act 1/2 and 2/2
        controller.Save();
        controller.Load();

        // Assume: session.PreviousGameState has game state as saved.
        // Assume: session.CurrentGameState has game state as loaded.
        // Assert that the GameState is the same after loading
        new JsonDiffAssertion(
                session.PreviousGameState!,
                session.CurrentGameState,
                GameSessionController.SaveJsonSerializerOptions)
            .Assert();

        GameStatePlayerView state = controller.GameStatePlayerView;
        Assert.Multiple(
            () =>
            {
                Assert.That(state.CurrentTurn, Is.EqualTo(7));
                Assert.That(
                    state.Assets.Agents.Count + state.TerminatedAgents.Count,
                    Is.EqualTo(10));
                Assert.That(state.Missions, Has.Count.EqualTo(1));
                Assert.That(state.MissionSites, Has.Count.EqualTo(2));

                // Test the references have been preserved,
                // i.e. no duplicate object instances have been introduced.
                Assert.That(
                    state.Missions[0].Site,
                    Is.SameAs(state.MissionSites[0]));
            });
    }

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}