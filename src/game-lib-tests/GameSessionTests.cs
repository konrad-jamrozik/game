using Lib.OS;
using Lib.Tests.Json;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class GameSessionTests
{
    // Using null! as these fields will be initialized in Setup() method.
    private Configuration _config = null!;
    private ILog _log = null!;
    private IRandomGen _randomGen = null!;
    private Factions _factions = null!;

    [SetUp]
    public void Setup()
    {
        _config = new Configuration(new FileSystem());
        _log = new Log(_config);
        _randomGen = new DeterministicRandomGen(missionSiteCountdown: 3);
        _factions = FactionFixtures.SingleFaction(_randomGen);
    }

    // kja3 overall work plan:
    //
    // implement charts in frontend instead of excel. chartjs.org etc.
    //
    // reimplement a bit more logic in the AIPlayer
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
        var session = new GameSession(_randomGen, factions: _factions);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.CurrentTurnController;

        GameState state = session.CurrentGameState;

        Assert.Multiple(
            () =>
            {
                Assert.That(state.Timeline.CurrentTurn, Is.EqualTo(1));
                Assert.That(state.Assets.Agents, Has.Count.EqualTo(0));
                Assert.That(state.Missions, Has.Count.EqualTo(0));
            });

        // Act
        turnController.HireAgents(count: 3);
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        MissionSite site = controller.CurrentGameStatePlayerView.MissionSites.First();
        turnController.LaunchMission(site, agentCount: 3);
        controller.AdvanceTime();

        GameState finalState = session.CurrentGameState;

        Assert.Multiple(() => {
            Assert.That(finalState.Timeline.CurrentTurn, Is.EqualTo(5), "currentTurn");
            Assert.That(
                finalState.AllAgents.Count,
                Is.EqualTo(3),
                "agentsHiredCount");
            Assert.That(finalState.Missions, Has.Count.EqualTo(1), "missionsLaunchedCount");

            Assert.That(
                state,
                Is.EqualTo(finalState),
                "starting state should be equal to final state");
            Assert.That(state.Assets.Agents, Is.EqualTo(finalState.Assets.Agents));
            Assert.That(state.Missions, Is.EqualTo(finalState.Missions));
        });
    }


    /// <summary>
    /// Given:
    ///   A non-trivial game state
    /// When:
    ///   That game state is saved, modified (by advancing time) and then the
    ///   game state is loaded.
    /// Then:
    ///   - Advancing time does not modify reference to the game session current game state.
    ///   - Advancing time does modify the game session current game state.
    ///   - Loading the game restores the game session current game state to how it was at the time it was saved.
    /// </summary>
    [Test]
    public void LoadingPreviousGameStateOverridesCurrentState()
    {
        var session = new GameSession(_randomGen);
        var controller = new GameSessionController(_config, _log, session);

        GameStatePlayerView stateView = controller.CurrentGameStatePlayerView;
        int savedTurn = stateView.CurrentTurn;
        GameState initialGameState = session.CurrentGameState.Clone();
        
        // Act 1: Save game, thus saving initialGameState to file
        controller.SaveCurrentGameStateToFile();

        // Act 2: Advance time, thus modifying the current game state
        controller.AdvanceTime();

        // Assert that advancing time didn't modify reference to the current game state
        Assert.That(stateView.StateReferenceEquals(controller.CurrentGameStatePlayerView));
        // Assert that advancing time has indeed modified the current game state
        Assert.That(stateView.CurrentTurn, Is.EqualTo(savedTurn + 1), "savedTurn+1");
        
        // Act 3: Load game, thus restoring the current game state to initialGameState
        GameState loadedGameState = controller.LoadCurrentGameStateFromFile();

        // Assert that after loading, the state view continues to reference current state.
        Assert.That(stateView.StateReferenceEquals(controller.CurrentGameStatePlayerView));

        Assert.That(loadedGameState, Is.EqualTo(session.CurrentGameState));
        Assert.That(loadedGameState, Is.EqualTo(initialGameState));
        
        Assert.That(stateView.CurrentTurn, Is.EqualTo(savedTurn), "savedTurn");

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
        var session = new GameSession(_randomGen, factions: _factions);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.CurrentTurnController;

        controller.AdvanceTime();
        controller.AdvanceTime();
        turnController.HireAgents(5);
        // Need to advance time here so that hired agents are no longer InTransit and can be
        // sent on a mission.
        controller.AdvanceTime();
        turnController.SackAgents(agentsIds: [0]);

        GameStatePlayerView state = controller.CurrentGameStatePlayerView;
        turnController.LaunchMission(
            state.MissionSites.Active.First(),
            agentCount: state.Assets.CurrentTransportCapacity);

        controller.AdvanceTime();
        controller.AdvanceTime();
        Assert.That(state.MissionSites.Active.Any(), Is.False);
        controller.AdvanceTime();
        Assert.That(state.MissionSites.Active.Any(), Is.True);
        controller.AdvanceTime();
        controller.AdvanceTime();
        controller.AdvanceTime();
        Assert.That(state.MissionSites.Expired.Any(), Is.False);
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
                Assert.That(state.CurrentTurn, Is.EqualTo(11));
                Assert.That(
                    state.Assets.Agents.Count + state.TerminatedAgents.Count,
                    Is.EqualTo(5));
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
        var session = new GameSession(_randomGen, factions: _factions);
        var controller = new GameSessionController(_config, _log, session);
        var turnController = controller.CurrentTurnController;
        GameStatePlayerView state = controller.CurrentGameStatePlayerView;

        controller.AdvanceTime();
        controller.AdvanceTime();
        turnController.HireAgents(5);
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
        var lastSavedGameState = controller.SaveCurrentGameStateToFile();
        var currentGameState = controller.LoadCurrentGameStateFromFile();

        // Assert: lastSavedGameState was never serialized to, or deserialized from json
        // Assert: currentGameState was serialized to, and then deserialized from json.
        // Note it especially important that lastSavedGameState was never serialized nor deserialized.
        // If it was, then both the states would have been, and doing JsonDiff would not
        // find any bugs where serialization or deserialization incorrectly handled a field.

        new JsonDiffAssertion(
            lastSavedGameState.JsonDiffWith(currentGameState)
        ).Assert();
    }

    [TearDown]
    public void TearDown()
    {
        _log.Dispose();
    }
}