using Lib.Json;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using ApplyPlayerActionResponse = Results<
    JsonHttpResult<GameSessionTurn>,
    BadRequest<string>>;

public static class ApplyPlayerActionRoute
{
    public static Task<ApplyPlayerActionResponse>
        ApplyPlayerAction(HttpRequest req)
    {
        return ApiUtils.TryProcessRoute(RouteFunc);

        async Task<JsonHttpResult<GameSessionTurn>> RouteFunc()
        {
            await Console.Out.WriteLineAsync("Invoked ApplyPlayerAction!");

            (ApplyPlayerActionRequestBody? body, string? error) = await ParseGameApplyPlayerActionBody(req);
            if (error != null)
                throw new ArgumentException(error);

            return ApplyPlayerActionInternal(body!.PlayerAction, body.GameState);
        }
    }

    private static JsonHttpResult<GameSessionTurn> ApplyPlayerActionInternal(
        PlayerActionPayload playerActionPayload,
        GameState? gameState)
    {
        Console.Out.WriteLine(
            $"Invoked ApplyPlayerActionInternal. " +
            $"playerAction: {playerActionPayload.ToIndentedUnsafeJsonString()}");

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        GameSession gameSession = ApiUtils.NewGameSession(gameState);
        var controller = new GameSessionController(config, log, gameSession);

        if (!(playerActionPayload.ActionName == "AdvanceTime" && gameState is null))
            gameSession.CurrentGameEvents.Add(playerActionPayload.Apply(controller));
        else
        {
            // If the player action is "AdvanceTime" and the gameState is null,
            // then we treat this as special case of "initialize game session to initial game state",
            // hence we just return the current game session turn.
        }

        JsonHttpResult<GameSessionTurn> result =
            ApiUtils.ToJsonHttpResult(gameSession.CurrentTurn);
        return result;
    }

    private static async Task<(ApplyPlayerActionRequestBody? body, string? error)> ParseGameApplyPlayerActionBody(
        HttpRequest req)
    {
        string? error;
        ApplyPlayerActionRequestBody? parsedBody;
        if (req.HasJsonContentType())
        {
            // Deserialization method invocation and configuration as explained by:
            // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
            parsedBody =
                (await req.ReadFromJsonAsync<ApplyPlayerActionRequestBody>(GameState.StateJsonSerializerOptions))!;
            error = null;
        }
        else
        {
            parsedBody = null;
            error = "Expected GameState and PlayerActionPayload to be passed in the request body";
        }

        return (parsedBody, error);
    }
}