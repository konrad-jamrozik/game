using System.Diagnostics;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using AdvanceTurnsResponse = Results<
    JsonHttpResult<List<GameState>>,
    JsonHttpResult<GameState>,
    BadRequest<string>>;

public static class AdvanceTurnsRoute
{
    /// <summary>
    /// Some cases for the "advanceTurns" route:
    /// advanceTurns with turn limit 1 and no game state: returns initialGameState having currentTurn of Timeline.InitialTurn
    /// advanceTurns with turn limit 1 and game state at turn 1: throws errors saying cannot advance to turn 1, already there
    /// advanceTurns with turn limit 2 and game state at turn 1: returns game state at turn 2
    /// advanceTurns with turn limit 2 and no game state: returns game states at turn 1 and 2
    /// advanceTurns with turn limit 50 and game state at turn 30: returns game states at turns 31 to 50
    /// </summary>
    public static async Task<AdvanceTurnsResponse>
        AdvanceTurns(HttpRequest req, int? turnLimit, bool? includeAllStates, bool? delegateToAi)
    {
        (GameState? gs, string? error) = await ApiUtils.ParseGameState(req);
        if (error != null)
            return TypedResults.BadRequest(error);

        if (turnLimit is not null && gs is not null && turnLimit <= gs.Timeline.CurrentTurn)
            return TypedResults.BadRequest(
                $"Cannot advance turns with turnLimit: {turnLimit}. " +
                $"Input game state turn is {gs.Timeline.CurrentTurn}. turnLimit must be higher than that.");

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
            ? ApiUtils.ToJsonHttpResult(
                SkipFirstTurn(gameSession.AllGameStatesAtTurnStarts(), newGameSession: initialGameState is null))
            : ApiUtils.ToJsonHttpResult(gameSession.CurrentGameState);

        Console.Out.WriteLine($"AdvanceTurnsInternal runtime: {stopwatch.Elapsed}");
        return result;
    }

    private static List<GameState> SkipFirstTurn(List<GameState> gameStates, bool newGameSession)
        => !newGameSession && gameStates.Count >= 2
            ? gameStates.Skip(1).ToList()
            : gameStates;
}