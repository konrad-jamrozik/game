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
            });

        app.MapGet(
                "/initialGameState",
                () => GetCurrentStateResponse(NewGameSession()))
            .Produces<GameState>();

        app.MapGet(
                "/initialGameStatePlayerView",
                () => GetCurrentStatePlayerViewResponse(NewGameSession()))
            .Produces<GameStatePlayerView>();

        // Multiple response types doc:
        // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0#multiple-response-types
        app.MapGet(
            "/simulateGameSession", 
            SimulateGameSession)
            .Produces<GameStatePlayerView>();

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
            .Accepts<GameState>("application/json");
    }

    private static
        Results<JsonHttpResult<GameStatePlayerView[]>, JsonHttpResult<GameStatePlayerView>, BadRequest<string>>
        SimulateGameSession(int? turnLimit, bool? includeAllStates)
    {
        (int turnLimitVal, string? error) = ParseTurnLimit(turnLimit);
        if (error != null)
            return TypedResults.BadRequest(error);

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var randomGen = new RandomGen(new Random());
        var intellect = AIPlayer.Intellect.Basic;
        var controller = new GameSessionController(config, log, new GameSession(randomGen));
        var aiPlayer = new AIPlayer(log, intellect);
        controller.PlayGameSession(turnLimit: turnLimitVal, aiPlayer);

        if (includeAllStates == true)
            return TypedResults.Json(
                controller.AllGameStatesPlayerViews(),
                GameState.StateJsonSerializerOptions);
        else
            return TypedResults.Json(
                controller.CurrentGameStatePlayerView,
                GameState.StateJsonSerializerOptions);
    }

    private static (int turnLimitVal, string? error) ParseTurnLimit(int? turnLimit)
    {
        int retTurnLimit = turnLimit ?? 30;
        int turnLimitLowerBound = 1;
        int turnLimitUpperBound = 300;
        string? error;

        if (retTurnLimit < turnLimitLowerBound || retTurnLimit > turnLimitUpperBound)
        {
            retTurnLimit = -1;
            error = $"Value of 'turnLimit' is out of accepted range. " +
                    $"It should be between {turnLimitLowerBound} and {turnLimitUpperBound}. " +
                    $"Actual value: {retTurnLimit}";
        }
        else
            error = null;

        return (retTurnLimit, error);
    }

    private static GameSession NewGameSession()
    {
        var gameSession = new GameSession(new RandomGen(new Random()));
        return gameSession;
    }

    private static JsonHttpResult<GameStatePlayerView> GetCurrentStatePlayerViewResponse(
        GameSession gameSession)
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

    private static JsonHttpResult<GameStatePlayerView> ToJsonHttpResult(GameStatePlayerView gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);
}