using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public class WebApplicationRoutes
{
    public void Register(WebApplication app)
    {
        app.MapGet(
            "/helloCoinFlip",
            () =>
            {
                var randomGen = new RandomGen(new Random());
                return $"Hello World! Coin flip: {randomGen.FlipCoin()}";
            })
            .WithTags("API");

        app.MapGet("/initialGameState", () => GetCurrentStateResponse(NewGameSession()))
            .Produces<GameState>()
            .WithTags("API");

        app.MapGet("/initialGameStatePlayerView", () => GetCurrentStatePlayerViewResponse(NewGameSession()))
            .Produces<GameStatePlayerView>()
            .WithTags("API");

        app.MapGet("/simulateGameSession", SimulateGameSession)
            .Produces<GameStatePlayerView>()
            .WithTags("API");

        app.MapPost(
                "/simulateGameSessionFromState",
                async (HttpRequest req, HttpResponse resp, int? turnLimit) =>
                {
                    if (req.HasJsonContentType())
                    {
                        // Deserialization handling as explained by:
                        // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
                        var gs = await req.ReadFromJsonAsync<GameState>(GameState.StateJsonSerializerOptions);
                        Console.WriteLine($"gs: {gs?.ToJsonString()}");

                        int turnLimitVal = turnLimit ?? 30;
                        Console.WriteLine($"turnLimitVal: {turnLimitVal}");

                        return TypedResults.Json(gs, GameState.StateJsonSerializerOptions);
                    }
                    else
                    {
                        return Results.BadRequest();
                    }
                })
            .Accepts<GameState>("application/json")
            .WithTags("API");
    }

    // Multiple response types doc:
    // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0#multiple-response-types
    private static
        Results<JsonHttpResult<GameStatePlayerView[]>, JsonHttpResult<GameStatePlayerView>, BadRequest<string>>
        SimulateGameSession(int? turnLimit, bool? includeAllStates)
    {
        (int parsedTurnLimit, string? error) = ParseTurnLimit(turnLimit);
        if (error != null)
            return TypedResults.BadRequest(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var gameSession = NewGameSession();
        var controller = new GameSessionController(config, log, gameSession);
        var aiPlayer = new AIPlayer(log, AIPlayer.Intellect.Basic);

        controller.PlayGameSession(turnLimit: parsedTurnLimit, aiPlayer);

        if (includeAllStates == true)
            return ToJsonHttpResult(controller.AllGameStatesPlayerViews());
        else
            return ToJsonHttpResult(controller.CurrentGameStatePlayerView);
    }

    private static (int turnLimitVal, string? error) ParseTurnLimit(int? turnLimit)
    {
        int parsedTurnLimit = turnLimit ?? 30;
        int turnLimitLowerBound = 1;
        int turnLimitUpperBound = 300;
        string? error;

        if (parsedTurnLimit < turnLimitLowerBound || parsedTurnLimit > turnLimitUpperBound)
        {
            parsedTurnLimit = -1;
            error = $"Value of 'turnLimit' is out of accepted range. " +
                    $"It should be between {turnLimitLowerBound} and {turnLimitUpperBound}. " +
                    $"Actual value: {parsedTurnLimit}";
        }
        else
            error = null;

        return (parsedTurnLimit, error);
    }

    private static GameSession NewGameSession()
    {
        var gameSession = new GameSession(new RandomGen(new Random()));
        return gameSession;
    }

    private static JsonHttpResult<GameStatePlayerView> GetCurrentStatePlayerViewResponse(GameSession gameSession)
    {
        var gameStatePlayerView = new GameStatePlayerView(() => gameSession.CurrentGameState);
        return ToJsonHttpResult(gameStatePlayerView);
    }

    private static JsonHttpResult<GameState> GetCurrentStateResponse(GameSession gameSession)
    {
        // This will be serialized to JSON per:
        // https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio#return-values
        // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-8.0#configure-json-serialization-options-for-an-endpoint
        GameState gs = gameSession.CurrentGameState;
        return ToJsonHttpResult(gs);
    }

    private static JsonHttpResult<GameState> ToJsonHttpResult(GameState gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);

    private static JsonHttpResult<GameState[]> ToJsonHttpResult(GameState[] gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);

    private static JsonHttpResult<GameStatePlayerView> ToJsonHttpResult(GameStatePlayerView gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);

    private static JsonHttpResult<GameStatePlayerView[]> ToJsonHttpResult(GameStatePlayerView[] gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);
}