using System.Diagnostics;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using AdvanceTurnsSuccessResponse = Results<
    JsonHttpResult<List<GameSessionTurn2>>,
    JsonHttpResult<GameSessionTurn2>>;

using AdvanceTurnsResponse = Results<
    Results<JsonHttpResult<List<GameSessionTurn2>>,
        JsonHttpResult<GameSessionTurn2>>,
    BadRequest<string>>;

public static class AdvanceTurnsRoute
{
    /// <summary>
    /// Some cases for the "advanceTurns" route: // kja need to update this comment
    /// advanceTurns with turn limit 1 and no game state: returns initialGameState having currentTurn of Timeline.InitialTurn
    /// advanceTurns with turn limit 1 and game state at turn 1: throws error saying cannot advance to turn 1, already there
    /// advanceTurns with turn limit 2 and game state at turn 1: returns game state at turn 2
    /// advanceTurns with turn limit 2 and no game state: returns game states at turn 1 and 2
    /// advanceTurns with turn limit 50 and game state at turn 30: returns game states at turns 31 to 50
    /// </summary>
    public static Task<AdvanceTurnsResponse>
        AdvanceTurns(HttpRequest req, int? turnLimit, bool? includeAllTurns, bool? delegateToAi)
    {
        return ApiUtils.TryProcessRoute(RouteFunc);

        async Task<AdvanceTurnsSuccessResponse> RouteFunc()
        {
            (GameState? gs, string? error) = await ApiUtils.ParseGameState(req);
            if (error != null)
                throw new ArgumentException(error);

            if (turnLimit is not null && gs is not null && turnLimit <= gs.Timeline.CurrentTurn)
                throw new ArgumentException(
                    $"Cannot advance turns with turnLimit: {turnLimit}. " +
                    $"Input game state turn is {gs.Timeline.CurrentTurn}. turnLimit must be higher than that.");

            return AdvanceTurnsInternal(turnLimit, includeAllTurns, delegateToAi, gs);
        }
    }

    private static AdvanceTurnsSuccessResponse AdvanceTurnsInternal(
        int? turnLimit,
        bool? includeAllTurns,
        bool? delegateToAi = false,
        GameState? initialGameState = null)
    {
        var stopwatch = Stopwatch.StartNew();

        (int parsedTurnLimit, string? error) = ApiUtils.ParseTurnLimit(turnLimit, initialGameState);
        if (error != null)
            throw new ArgumentException(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        GameSession2 gameSession = ApiUtils.NewGameSession(initialGameState);
        var controller = new GameSessionController2(config, log, gameSession);
        var aiPlayer = new AIPlayer(
            log,
            delegateToAi == true
                ? AIPlayer.Intellect.Basic
                : AIPlayer.Intellect.DoNothing);

        controller.PlayGameSession(turnLimit: parsedTurnLimit, aiPlayer);

        AdvanceTurnsSuccessResponse result = includeAllTurns == true
            ? ApiUtils.ToJsonHttpResult(SkipFirstTurn(gameSession.Turns, initialGameState == null))
            : ApiUtils.ToJsonHttpResult(gameSession.CurrentTurn);

        Console.Out.WriteLine($"AdvanceTurnsInternal runtime: {stopwatch.Elapsed}");
        return result;
    }

    // kja not sure why this was needed. Need to test and document.
    private static List<GameSessionTurn2> SkipFirstTurn(List<GameSessionTurn2> gameSessionTurns, bool newGameSession)
        => !newGameSession && gameSessionTurns.Count >= 2
            ? gameSessionTurns.Skip(1).ToList()
            : gameSessionTurns;

    // This is previous logic. I think it was like this:
    // By default we skip first game state, because it is the input game state given as input to advance turns
    // - If the game session is new, then there is no input game state, so we don't skip first state.
    // - If there was only game state at a turn start then perhaps in some other way we ended up with only one state
    // and we should return it. Unclear how. Maybe this should be an assertion? That if game session is not new, then there are at least 2 game states at turn starts.
    // https://github.com/konrad-jamrozik/game/commit/aa4c0a96ce969636475ddac4583b661c37e8e18e#diff-fa76d405056770e706454fd0926fa05898c9f4a4010ac3ee7dddfb0609ff5fbe
    private static List<GameState> SkipFirstTurn(List<GameState> gameStates, bool newGameSession)
        => !newGameSession && gameStates.Count >= 2
            ? gameStates.Skip(1).ToList()
            : gameStates;
}