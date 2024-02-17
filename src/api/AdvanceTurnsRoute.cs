using System.Diagnostics;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using AdvanceTurnsResponse = Results<
    JsonHttpResult<GameState[]>,
    JsonHttpResult<GameState>,
    BadRequest<string>>;

public static class AdvanceTurnsRoute
{
    public static async Task<AdvanceTurnsResponse>
        AdvanceTurns(HttpRequest req, int? turnLimit, bool? includeAllStates, bool? delegateToAi)
    {
        (GameState? gs, string? error) = await ApiUtils.ParseGameState(req);
        if (error != null)
            return TypedResults.BadRequest(error);

        return AdvanceTurnsInternal(turnLimit, includeAllStates, delegateToAi, gs);
    }

    private static AdvanceTurnsResponse AdvanceTurnsInternal(
            int? turnLimit,
            bool? includeAllStates,
            bool? delegateToAi = false,
            GameState? initialGameState = null)
    {
        var stopwatch = Stopwatch.StartNew();

        (int parsedTurnLimit, string? error) = ApiUtils.ParseTurnLimit(turnLimit, initialGameState);
        if (error != null)
            return TypedResults.BadRequest(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var gameSession = ApiUtils.NewGameSession(initialGameState);
        var controller = new GameSessionController(config, log, gameSession);
        var aiPlayer = new AIPlayer(
            log,
            delegateToAi == true
                ? AIPlayer.Intellect.Basic
                : AIPlayer.Intellect.DoNothing);

        controller.PlayGameSession(turnLimit: parsedTurnLimit, aiPlayer);

        AdvanceTurnsResponse result = includeAllStates == true
            ? ApiUtils.ToJsonHttpResult(gameSession.AllGameStatesAtTurnStarts())
            : ApiUtils.ToJsonHttpResult(gameSession.CurrentGameState);

        Console.Out.WriteLine($"AdvanceTurnsInternal runtime: {stopwatch.Elapsed}");
        return result;
    }
}