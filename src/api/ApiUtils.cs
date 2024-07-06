using System.Text.Json;
using Lib.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public static class ApiUtils
{
    public static async Task<Results<T, BadRequest<string>>> TryProcessRoute<T>(
        Func<Task<T>> routeFunc) where T : IResult
    {
        try
        {
            return await routeFunc();
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return TypedResults.BadRequest(e.Message);
        }
    }

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
                parsedGameState = (requestBody.FromJsonTo<GameState>(GameState.JsonSerializerOptions));
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

    public static async Task<(GameSessionTurn? turn, string? error)> ParseGameSessionTurn(HttpRequest req)
    {
        string? error;
        GameSessionTurn? parsedTurn;
        if (req.HasJsonContentType())
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            if (string.IsNullOrEmpty(requestBody) || EmptyJson(requestBody))
            {
                parsedTurn = null;
                error = null;
            }
            else
            {
                // Deserialization method invocation and configuration as explained by:
                // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
                parsedTurn = (requestBody.FromJsonTo<GameSessionTurn>(GameSessionTurn.JsonSerializerOptions));
                // If the input game session turn would have advance time event, besides conceptually not making sense,
                // it would throw off the NextEventId calculation, as game session could start appending player action events to current turn
                // counting from event ID beyond AdvanceTurnEvent, but all player action events must have consecutive IDs, with no
                // IDs taken away from the middle due to advance time event.
                error = (parsedTurn.AdvanceTimeEvent == null) ? null : "The input turn cannot have advance time event";
            }
        }
        else
        {
            parsedTurn = null;
            error = "Expected GameSessionTurn to be passed in the request body";
        }

        return (parsedTurn, error);
    }

    private static bool EmptyJson(string requestBody)
    {
        var jsonDoc = JsonDocument.Parse(requestBody);
        return jsonDoc.RootElement.ValueKind == JsonValueKind.Object &&
               jsonDoc.RootElement.EnumerateObject().MoveNext() == false;
    }

    public static GameSession NewGameSession(GameState? initialGameState = null)
    {
        List<GameSessionTurn>? turnList = initialGameState != null ? [new GameSessionTurn(startState: initialGameState)] : null;
        var gameSession = new GameSession(new RandomGen(), turnList);
        return gameSession;
    }

    public static GameSession NewGameSessionFromTurn(GameSessionTurn? initialTurn = null)
    {
        List<GameSessionTurn>? turnList = initialTurn != null ? [initialTurn] : null;
        var gameSession = new GameSession(new RandomGen(), turnList);
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

    public static JsonHttpResult<GameSessionTurn> ToJsonHttpResult(GameSessionTurn gst)
        => TypedResults.Json(gst, GameSessionTurn.JsonSerializerOptions);

    public static JsonHttpResult<List<GameSessionTurn>> ToJsonHttpResult(List<GameSessionTurn> gsts)
        => TypedResults.Json(gsts, GameSessionTurn.JsonSerializerOptions);

    public static JsonHttpResult<GameState> ToJsonHttpResult(GameState gs)
        => TypedResults.Json(gs, GameState.JsonSerializerOptions);

    public static JsonHttpResult<List<GameState>> ToJsonHttpResult(List<GameState> gss)
        => TypedResults.Json(gss, GameState.JsonSerializerOptions);

    public static JsonHttpResult<GameStatePlayerView> ToJsonHttpResult(GameStatePlayerView gs)
        => TypedResults.Json(gs, GameState.JsonSerializerOptions);

    public static JsonHttpResult<List<GameStatePlayerView>> ToJsonHttpResult(List<GameStatePlayerView> gss)
        => TypedResults.Json(gss, GameState.JsonSerializerOptions);

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
