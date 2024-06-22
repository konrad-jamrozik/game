using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.Reports;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

/// <summary>
/// Represents means for controlling GameSession, to be called by client logic (e.g. CLI) acting on behalf of
/// a player, whether human or automated.
///
/// Provides following features, as compared to accessing GameSession directly:
/// - Convenient methods representing player actions that are translated by the controller
/// to underlying low-level GameSession methods invocations.
/// - Restricted Read/Write access to the GameSession. Notably, a player should not be able
/// to read entire game session state, only parts visible to them.
///
/// Here are few scenarios of using GameSessionController:
///
/// 1. A human player calls the CLI executable built from game-cli.
/// The implementation of that executable, Program.cs, translates the CLI commands to invocations
/// of GameSessionController methods. The output of these methods is returned through Program.cs to the human player.
/// 2. As 1. but the CLI commands are called not by a human, but by an automated process (aka automated player).
/// 3. The CLI executable is used by human player to launch a game session using an AI player.
/// As a result, the CLI program ends up instantiating AIPlayer instance which then plays through the game by
/// invoking methods on GameSessionController.
/// 4. As 3. but the CLI commands are called not by a human, but by an automated process (aka automated player).
///
/// The scenarios above can be visualized as follows, where "--" should be read as:
///   "Left side invokes right side, and right side returns output to the left side".
///
/// ```
/// 1. Human player     -- CLI executable -- Program --             GameSessionController -- GameSession
/// 2. Automated player -- CLI executable -- Program --             GameSessionController -- GameSession
/// 3. Human player     -- CLI executable -- Program -- AIPlayer -- GameSessionController -- GameSession
/// 4. Automated player -- CLI executable -- Program -- AIPlayer -- GameSessionController -- GameSession
/// ```
/// </summary>
public class GameSessionController
{
    protected readonly GameSession GameSession;
    private readonly Configuration _config;
    private readonly ILog _log;
    public GameTurnController CurrentTurnController { get; }
    private readonly TimeAdvancementController _timeAdvancementController;

    public GameSessionController(Configuration config, ILog log, GameSession gameSession)
    {
        _config = config;
        _log = log;
        GameSession = gameSession;
        CurrentTurnController = new GameTurnController(
            _log,
            GameSession.RandomGen,
            GameSession.EventIdGen,
            GameSession.AgentIdGen,
            GameSession.MissionIdGen,
            () => GameSession.CurrentGameState);
        _timeAdvancementController = new TimeAdvancementController(
            _log,
            GameSession.RandomGen,
            GameSession.EventIdGen,
            GameSession.MissionSiteIdGen);
    }

    public GameStatePlayerView CurrentGameStatePlayerView
        => new GameStatePlayerView(() => GameSession.CurrentGameState);

    public void PlayGameSession(int turnLimit, IPlayer player)
    {
        // Assert:
        // IF the GameSession was ctored with null initialGameState,
        // THEN CurrentGameStatePlayerView.CurrentTurn == Timeline.InitialTurn
        Contract.Assert(CurrentGameStatePlayerView.CurrentTurn >= Timeline.InitialTurn);
        Contract.Assert(turnLimit <= GameState.MaxTurnLimit);
        Contract.Assert(turnLimit >= CurrentGameStatePlayerView.CurrentTurn);

        PlayGameUntilOver(player, turnLimit);

        var endState = GameSession.CurrentGameState;

        _log.Info("");
        _log.Info(
            $"===== Game over! " +
            $"Game result: {(endState.IsGameLost ? "lost" : endState.IsGameWon ? "won" : "undecided")}");
        _log.Info(
            $"Money: {endState.Assets.Money}, " +
            $"Intel: {endState.Assets.Intel}, " +
            $"Funding: {endState.Assets.Funding}, " +
            $"Upkeep: {endState.Assets.Agents.UpkeepCost}, " +
            $"Support: {endState.Assets.Support}, " +
            $"Transport cap.: {endState.Assets.MaxTransportCapacity}, " +
            $"Missions launched: {endState.Missions.Count}, " +
            $"Missions successful: {endState.Missions.Successful.Count}, " +
            $"Missions failed: {endState.Missions.Failed.Count}, " +
            $"Mission sites expired: {endState.MissionSites.Expired.Count}, " +
            $"Agents: {endState.Assets.Agents.Count}, " +
            $"Terminated agents: {endState.TerminatedAgents.Count}, " +
            $"Turn: {endState.Timeline.CurrentTurn} / {turnLimit}.");

        SaveCurrentGameStateToFile();

        new GameSessionStatsReport(
                _log,
                GameSession,
                _config.TurnReportCsvFile,
                _config.AgentReportCsvFile,
                _config.MissionSiteReportCsvFile,
                endState.Timeline.CurrentTurn)
            .Write();

        _log.Flush();
    }

    private void PlayGameUntilOver(IPlayer player, int turnLimit)
    {
        // Note: in the boundary case of
        //
        //  turnLimit == GameSession.CurrentGameState.Timeline.CurrentTurn
        //
        // e.g. when the game session is new and turnLimit == Timeline.InitialTurn,
        // the game session will be immediately over, without the player getting a chance to do
        // anything.
        while (!GameSessionOver(GameSession.CurrentGameState, turnLimit))
        {
            _log.Info("");
            _log.Info($"===== Turn {GameSession.CurrentGameState.Timeline.CurrentTurn}");
            _log.Info("");

            player.PlayGameTurn(CurrentGameStatePlayerView, CurrentTurnController);

            List<PlayerActionEvent> playerActionEvents = CurrentTurnController.GetAndDeleteRecordedPlayerActionEvents();
            GameSession.CurrentPlayerActionEvents.AddRange(playerActionEvents);

            if (GameSession.CurrentGameState.IsGameOver)
                break;

            Contract.Assert(!GameSession.CurrentGameState.IsGameOver);

            // This state diff shows what actions the player took.
            DiffGameStates(GameSession.CurrentTurn.StartState, GameSession.CurrentGameState);

            GameState nextTurnStartState = GameSession.CurrentGameState.Clone();

            (PlayerActionEvent advanceTimeEvent, List<WorldEvent> worldEvents) = AdvanceTime(nextTurnStartState);
            GameSession.CurrentTurn.AdvanceTimeEvent = advanceTimeEvent;

            // This state diff shows the result of advancing time.
            DiffGameStates(GameSession.CurrentGameState, nextTurnStartState);

            GameSession.CurrentTurn.AssertInvariants();
            NewTurn(worldEvents, nextTurnStartState);
            GameSession.EventIdGen.AssertInvariants(GameSession.Turns);
        }

        // Ensure NextEventId is set to right value in case we end up in special case of no events -
        // see comment on NextEventId for details.
        GameSession.CurrentTurn.NextEventId = GameSession.EventIdGen.Value;
    }

    private void NewTurn(List<WorldEvent> worldEvents, GameState nextTurnStartState)
    {
        GameSession.Turns.Add(
            new GameSessionTurn(
                eventsUntilStartState: worldEvents,
                startState: nextTurnStartState,
                nextEventId: GameSession.EventIdGen.Value));
    }

    public (PlayerActionEvent advaceTimeEvent, List<WorldEvent> worldEvents) AdvanceTime(GameState? state = null)
        => _timeAdvancementController.AdvanceTime(state ?? GameSession.CurrentGameState);

    public GameState SaveCurrentGameStateToFile()
    {
        GameSession.CurrentGameState.ToJsonFile(_config.SaveFile);
        _log.Info($"Saved game state to {_config.SaveFile.FullPath}");
        return GameSession.CurrentGameState;
    }

    public GameState LoadCurrentGameStateFromFile()
    {
        GameState loadedGameState = GameState.FromJsonFile(_config.SaveFile);
        GameSession.Turns.Add(new GameSessionTurn(startState: loadedGameState));
        _log.Info($"Loaded game state from {_config.SaveFile.FullPath}");
        return GameSession.CurrentGameState;
    }

    private static bool GameSessionOver(GameState state, int turnLimit)
    {
        Contract.Assert(
            state.Timeline.CurrentTurn <= turnLimit,
            "It should not be possible for current state turn to go above turnLimit");
        return state.IsGameOver || state.Timeline.CurrentTurn == turnLimit;
    }

    private void DiffGameStates(GameState prev, GameState curr)
    {
        Contract.Assert(!ReferenceEquals(prev, curr));
        new GameStateDiff(prev, curr).PrintTo(_log);
    }
}