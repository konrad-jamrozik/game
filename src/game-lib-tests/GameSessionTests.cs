using Lib.OS;
using Lib.Tests.Json;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

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
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.TurnController;

        GameState startingState = session.CurrentGameState;

        Assert.Multiple(
            () =>
            {
                Assert.That(startingState.Timeline.CurrentTurn, Is.EqualTo(1));
                Assert.That(startingState.Assets.Agents, Has.Count.EqualTo(0));
                Assert.That(startingState.Missions, Has.Count.EqualTo(0));
            });

        // Act
        turnController.HireAgents(count: 3);
        controller.AdvanceTime();
        controller.AdvanceTime();
        MissionSite site = controller.GameStatePlayerView.MissionSites.First();
        turnController.LaunchMission(site, agentCount: 3);
        controller.AdvanceTime();

        var finalState = session.CurrentGameState;

        Assert.Multiple(() => {
            Assert.That(finalState.Timeline.CurrentTurn, Is.EqualTo(4), "currentTurn");
            Assert.That(
                finalState.AllAgents.Count,
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

    /// <summary>
    /// Given:
    ///   A non-trivial game state
    /// When:
    ///   That game state is saved, modified (by advancing time) and then the
    ///   game state is loaded.
    /// Then:
    ///   - Loading the game restores it to how it was before it was saved.
    /// </summary>
    [Test]
    public void LoadingPreviousGameStateOverridesCurrentState()
    {
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);

        GameStatePlayerView state = controller.GameStatePlayerView;
        int savedTurn = state.CurrentTurn;
        // kja bug: this should be copy reference. Because when it isn't, then advancing time
        // mutates the state's current turn, and startingGameState points to the mutated state.
        GameState startingGameState = session.CurrentGameState;

        // Act 1/2
        controller.SaveGameState();

        controller.AdvanceTime();
        
        // Here we verify that advancing time has indeed modified the current
        // game state
        Assert.That(state.CurrentTurn, Is.EqualTo(controller.GameStatePlayerView.CurrentTurn));
        Assert.That(state.CurrentTurn, Is.EqualTo(savedTurn + 1), "savedTurn+1");
        
        // Act 2/2
        GameState loadedGameState = controller.Load();

        Assert.That(loadedGameState, Is.EqualTo(session.CurrentGameState));
        // kja this will fail because since I updated to NUnit 4.0.0, the objects are considered equal,
        // because NUnit 4.0.0 compares all public properties. See:
        // https://github.com/nunit/nunit/pull/4436
        // https://github.com/nunit/nunit/issues/4394
        // Above are mentioned in:
        // https://docs.nunit.org/articles/nunit/release-notes/framework.html#enhancements
        // linked from:
        // https://docs.nunit.org/articles/nunit/release-notes/breaking-changes.html#nunit-40
        // I triggered this bug by this change:
        // https://github.com/konrad-jamrozik/game/commit/fa17b0985af7adde4f135be3d231555b6e7621ee#diff-718fb94a7176526686c9940ce6d3b5350e548e26a234b86a7cdd4817e68b3b52R10
        Assert.That(loadedGameState, Is.Not.EqualTo(startingGameState));
        Assert.That(state.CurrentTurn, Is.EqualTo(savedTurn), "savedTurn");
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
    ///   - The resulting loaded game state is the same as before saving
    ///   - and no duplicate instance objects have been introduced
    ///     during serialization (saving) or deserialization (loading)
    ///   - and some properties have values exactly as expected.
    /// </summary>
    [Test]
    public void RoundTrippingSavingAndLoadingGameStateBehavesCorrectly()
    {
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.TurnController;

        controller.AdvanceTime();
        controller.AdvanceTime();
        turnController.HireAgents(10);
        // Need to advance time here so that hired agents are no longer InTransit and can be
        // sent on a mission.
        controller.AdvanceTime();
        turnController.SackAgent(id: 0);

        GameStatePlayerView state = controller.GameStatePlayerView;
        turnController.LaunchMission(
            state.MissionSites.Active.First(),
            agentCount: state.Assets.CurrentTransportCapacity);

        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        
        Assert.Multiple(
            () =>
            {
                Assert.That(state.MissionSites.Active.Any(), Is.True);
                Assert.That(state.MissionSites.Launched.Any(), Is.True);
                Assert.That(state.MissionSites.Expired.Any(), Is.True);
                // The fact this assert returns true confirms the need to have the test
                // RoundTrippingSavingAndLoadingGameStateWithActiveMissionBehavesCorrectly
                Assert.That(!state.Missions.Active.Any());
            });

        // Act
        VerifyGameSatesByJsonDiff(controller);

        Assert.Multiple(
            () =>
            {
                Assert.That(state.CurrentTurn, Is.EqualTo(10));
                Assert.That(
                    state.Assets.Agents.Count + state.TerminatedAgents.Count,
                    Is.EqualTo(10));
                Assert.That(state.Missions, Has.Count.EqualTo(1));
                Assert.That(state.MissionSites, Has.Count.EqualTo(3));

                // Test the references have been preserved,
                // i.e. no duplicate object instances have been introduced.
                Assert.That(
                    state.Missions[0].Site,
                    Is.SameAs(state.MissionSites[0]));
            });
    }

    /// <summary>
    /// This test is like RoundTrippingSavingAndLoadingGameStateBehavesCorrectly
    /// but when the game is saved there is an active mission.
    /// </summary>
    [Test]
    public void RoundTrippingSavingAndLoadingGameStateWithActiveMissionBehavesCorrectly()
    {
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.TurnController;
        GameStatePlayerView state = controller.GameStatePlayerView;

        controller.AdvanceTime();
        turnController.HireAgents(10);
        // Need to advance time here so that hired agents are no longer InTransit and can be
        // sent on a mission.
        controller.AdvanceTime();
        
        Assert.That(state.MissionSites.Active.Any(), Is.True);
        
        turnController.LaunchMission(
            state.MissionSites.Active.First(),
            agentCount: state.Assets.CurrentTransportCapacity);

        Assert.That(state.Missions.Active.Any());

        // Act
        VerifyGameSatesByJsonDiff(controller);
    }


    private static void VerifyGameSatesByJsonDiff(GameSessionController controller)
    {
        // Act 1/2 and 2/2
        var lastSavedGameState = controller.SaveGameState();
        var currentGameState = controller.Load();

        // Assert: lastSavedGameState was never serialized to, or deserialized from json
        // Assert: currentGameState was serialized to, and then deserialized from json.
        // Note it especially important that lastSavedGameState was never serialized nor deserialized.
        // If it was, then both the states would have been, and doing JsonDiff would not
        // find any bugs where serialization or deserialization incorrectly handled a field.

        new JsonDiffAssertion(
                lastSavedGameState,
                currentGameState,
                GameSession.StateJsonSerializerOptions)
            .Assert();
    }

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}