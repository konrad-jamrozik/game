using System.Diagnostics;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using AdvanceTurnsSuccessResponse = JsonHttpResult<List<GameSessionTurn>>;

using AdvanceTurnsResponse = Results<
    JsonHttpResult<List<GameSessionTurn>>,
    BadRequest<string>>;

public static class AdvanceTurnsRoute
{
    /// <summary>
    /// Some cases for the "advanceTurns" route:
    /// advanceTurns with turn limit 1 and no turn: returns [initialTurn] having turn number of Timeline.InitialTurn
    /// advanceTurns with turn limit 1 and turn with turn number 1: throws error saying cannot advance to turn 1, already there
    /// advanceTurns with turn limit 2 and turn at turn number 1: returns [turn at turn 1, turn at turn 2]
    /// advanceTurns with turn limit 2 and no turn: returns [turn at turn 1, turn at turn 2]
    /// advanceTurns with turn limit 50 and turn at turn 30: returns turns at turn numbers from 30 to 50,
    /// unless game ended before turn 50.
    /// </summary>
    public static Task<AdvanceTurnsResponse>
        AdvanceTurns(HttpRequest req, int? turnLimit, string? aiPlayer = null)
    {
        return ApiUtils.TryProcessRoute(RouteFunc);

        async Task<AdvanceTurnsSuccessResponse> RouteFunc()
        {
            (GameSessionTurn? turn, string? error) = await ApiUtils.ParseGameSessionTurn(req);
            if (error != null)
                throw new ArgumentException(error);

            if (turnLimit is not null && turn is not null && turnLimit <= turn.StartState.Timeline.CurrentTurn)
                throw new ArgumentException(
                    $"Cannot advance turns with turnLimit: {turnLimit}. " +
                    $"Input game state turn is {turn.StartState.Timeline.CurrentTurn}. turnLimit must be higher than that.");

            return AdvanceTurnsInternal(turnLimit, aiPlayer, turn);
        }
    }

    private static AdvanceTurnsSuccessResponse AdvanceTurnsInternal(
        int? turnLimit,
        string? aiPlayer = null,
        GameSessionTurn? initialTurn = null)
    {
        var stopwatch = Stopwatch.StartNew();

        (int parsedTurnLimit, string? error) = ApiUtils.ParseTurnLimit(turnLimit, initialTurn?.StartState);
        if (error != null)
            throw new ArgumentException(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        GameSession gameSession = ApiUtils.NewGameSessionFromTurn(initialTurn);
        var controller = new GameSessionController(config, log, gameSession);

        var aiPlayerName = new AIPlayerName(aiPlayer ?? AIPlayerName.DoNothing.ToString());

        var aiPlayerInstance = IAIPlayer.New(log, aiPlayerName);

        controller.PlayGameSession(turnLimit: parsedTurnLimit, aiPlayerInstance);

        AdvanceTurnsSuccessResponse result = ApiUtils.ToJsonHttpResult(gameSession.Turns);

        log.Info($"AdvanceTurnsInternal runtime: {stopwatch.Elapsed}");
        return result;
    }
}
