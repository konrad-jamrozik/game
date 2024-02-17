using System.Text.Json;
using Lib.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public static class ApiUtils
{
    public static (int turnLimitVal, string? error) ParseTurnLimit(int? turnLimit, GameState? initialGameState)
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

    public static async Task<(GameState? gameState, string? error)> ParseGameState(HttpRequest req)
    {
        string? error;
        GameState? parsedGameState;
        if (req.HasJsonContentType())
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            if (string.IsNullOrEmpty(requestBody))
            {
                parsedGameState = null;
                error = null;
            }
            else
            {
                // Deserialization method invocation and configuration as explained by:
                // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
                parsedGameState = (requestBody.FromJsonTo<GameState>(GameState.StateJsonSerializerOptions));
                error = null;
            }
        }
        else
        {
            parsedGameState = null;
            error = "Expected GameState to be passed in the request body";
        }

        return (parsedGameState, error);
    }

    public static GameSession NewGameSession(GameState? initialGameState = null)
    {
        var gameSession = new GameSession(new RandomGen(new Random()), initialGameState);
        return gameSession;
    }

    public static JsonHttpResult<GameState> GetCurrentStateResponse(GameSession gameSession)
    {
        // This will be serialized to JSON per:
        // https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio#return-values
        // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-8.0#configure-json-serialization-options-for-an-endpoint
        GameState gs = gameSession.CurrentGameState;
        return ToJsonHttpResult(gs);
    }

    public static JsonHttpResult<GameStatePlayerView> GetCurrentStatePlayerViewResponse(GameSession gameSession)
    {
        var gameStatePlayerView = new GameStatePlayerView(() => gameSession.CurrentGameState);
        return ToJsonHttpResult(gameStatePlayerView);
    }

    public static JsonHttpResult<GameState> ToJsonHttpResult(GameState gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);

    public static JsonHttpResult<List<GameState>> ToJsonHttpResult(List<GameState> gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);

    public static JsonHttpResult<GameStatePlayerView> ToJsonHttpResult(GameStatePlayerView gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);

    public static JsonHttpResult<List<GameStatePlayerView>> ToJsonHttpResult(List<GameStatePlayerView> gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);

    public static async Task<JsonElement> ParseJsonElement(HttpRequest request)
    {
        using var jsonDoc = await JsonDocument.ParseAsync(request.Body);
        JsonElement root = jsonDoc.RootElement;
        return root.Clone();
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