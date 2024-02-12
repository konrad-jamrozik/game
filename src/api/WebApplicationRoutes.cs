using System.Diagnostics;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using SimulationResponse = Results<
    JsonHttpResult<GameState[]>,
    JsonHttpResult<GameState>,
    BadRequest<string>>;

using ApplyPlayerActionResponse = Results<
    JsonHttpResult<GameState>,
    BadRequest<string>>;

public class WebApplicationRoutes
{
    public void Register(WebApplication app)
    {
        app.MapGet("/helloCoinFlip", HelloCoinFlip)
            .WithTags("API");

        app.MapGet("/initialGameState", () => ApiUtils.GetCurrentStateResponse(NewGameSession()))
            .Produces<GameState>()
            .WithTags("API");

        app.MapGet("/initialGameStatePlayerView", () => ApiUtils.GetCurrentStatePlayerViewResponse(NewGameSession()))
            .Produces<GameStatePlayerView>()
            .WithTags("API");

        app.MapGet("/simulateGameSession", SimulateGameSession)
            .Produces<GameState>()
            .WithTags("API");

        app.MapPost("/simulateGameSessionFromState", SimulateGameSessionFromState)
            .Accepts<GameState>("application/json")
            .Produces<GameState>()
            .WithTags("API");

        app.MapPost("/applyPlayerAction", ApplyPlayerAction)
            .Accepts<GameState>("application/json")
            .Produces<GameState>()
            .WithTags("API");
    }

    private static string HelloCoinFlip()
    {
        var randomGen = new RandomGen(new Random());
        return $"Hello World! Coin flip: {randomGen.FlipCoin()}";
    }

    private static async Task<SimulationResponse>
        SimulateGameSessionFromState(HttpRequest req, int? turnLimit, bool? includeAllStates)
    {
        (GameState? gs, string? error) = await ParseGameState(req);
        if (error != null)
            return TypedResults.BadRequest(error);

        return SimulateGameSessionInternal(turnLimit, includeAllStates, gs!);
    }

    private static SimulationResponse
        SimulateGameSession(int? turnLimit, bool? includeAllStates)
    {
        return SimulateGameSessionInternal(turnLimit, includeAllStates, null);
    }

    private static SimulationResponse
        SimulateGameSessionInternal(int? turnLimit, bool? includeAllStates, GameState? initialGameState)
    {
        var stopwatch = Stopwatch.StartNew();

        (int parsedTurnLimit, string? error) = ParseTurnLimit(turnLimit, initialGameState);
        if (error != null)
            return TypedResults.BadRequest(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var gameSession = NewGameSession(initialGameState);
        var controller = new GameSessionController(config, log, gameSession);
        var aiPlayer = new AIPlayer(log, AIPlayer.Intellect.Basic);

        controller.PlayGameSession(turnLimit: parsedTurnLimit, aiPlayer);

        SimulationResponse result = includeAllStates == true
            ? ApiUtils.ToJsonHttpResult(gameSession.AllGameStatesAtTurnStarts())
            : ApiUtils.ToJsonHttpResult(gameSession.CurrentGameState);

        Console.Out.WriteLine($"SimulateGameSessionInternal runtime: {stopwatch.Elapsed}");
        return result;
    }

    private static async Task<ApplyPlayerActionResponse>
        ApplyPlayerAction(HttpRequest req)
    {
        Console.Out.WriteLine("Invoked ApplyPlayerAction!");
        (GameState? gs, string? error) = await ParseGameState(req);
        if (error != null)
            return TypedResults.BadRequest(error);

        // kja WIP
        return ApplyPlayerActionInternal(gs!, new PlayerActionPayload());
    }

    private static ApplyPlayerActionResponse
        ApplyPlayerActionInternal(GameState gameState, PlayerActionPayload playerAction)
    {

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var gameSession = NewGameSession(gameState);
        var controller = new GameSessionController(config, log, gameSession);

        playerAction.Apply(controller);

        ApplyPlayerActionResponse result = ApiUtils.ToJsonHttpResult(gameSession.CurrentGameState);
        return result;
    }

    private static (int turnLimitVal, string? error) ParseTurnLimit(int? turnLimit, GameState? initialGameState)
    {
        int parsedTurnLimit = turnLimit ?? 30;
        int turnLimitLowerBound =
            initialGameState?.Timeline.CurrentTurn ?? Timeline.InitialTurn;
        int turnLimitUpperBound = 300;
        string? error;

        if (parsedTurnLimit < turnLimitLowerBound || parsedTurnLimit > turnLimitUpperBound)
        {
            error = $"Value of 'turnLimit' is out of accepted range. " +
                    $"It should be between {turnLimitLowerBound} and {turnLimitUpperBound}. " +
                    $"Actual value: {parsedTurnLimit}";
            parsedTurnLimit = -1;
        }
        else
            error = null;

        return (parsedTurnLimit, error);
    }
    private static async Task<(GameState? gameState, string? error)> ParseGameState(HttpRequest req)
    {
        string? error;
        GameState? parsedGameState;
        if (req.HasJsonContentType())
        {
            // Deserialization method invocation and configuration as explained by:
            // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
            parsedGameState = (await req.ReadFromJsonAsync<GameState>(GameState.StateJsonSerializerOptions))!;
            error = null;
        }
        else
        {
            parsedGameState = null;
            error = "Expected GameState to be passed in the request body";
        }

        return (parsedGameState, error);
    }

    private static GameSession NewGameSession(GameState? initialGameState = null)
    {
        var gameSession = new GameSession(new RandomGen(new Random()), initialGameState);
        return gameSession;
    }
}


// Relevant docs:
//
// TypedResults
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-8.0#return-typedresults
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0#describe-response-types
//
// Multiple response types (Results<>) doc:
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0#multiple-response-types
//
// [System.Text.Json] : More accurate error messages when failing to map fields or parameters #88048
// https://github.com/dotnet/runtime/issues/88048
