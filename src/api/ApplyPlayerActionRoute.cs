using Lib.Json;
using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Api;

using ApplyPlayerActionResponse = Results<
    JsonHttpResult<GameState>,
    BadRequest<string>>;

public static class ApplyPlayerActionRoute
{
    public static async Task<ApplyPlayerActionResponse>
        ApplyPlayerAction(HttpRequest req)
    {
        async Task<JsonHttpResult<GameState>> RouteFunc()
        {
            await Console.Out.WriteLineAsync("Invoked ApplyPlayerAction!");

            (ApplyPlayerActionRequestBody? body, string? error) = await ParseGameApplyPlayerActionBody(req);
            if (error != null)
                throw new ArgumentException(error);

            return ApplyPlayerActionInternal(body!.PlayerAction, body.GameState);
        }

        return await ApiUtils.TryProcessRoute(RouteFunc);
    }

    private static JsonHttpResult<GameState> ApplyPlayerActionInternal(
        PlayerActionPayload playerAction,
        GameState? gameState)
    {
        Console.Out.WriteLine(
            $"Invoked ApplyPlayerActionInternal! " +
            $"playerAction: {playerAction.ToIndentedUnsafeJsonString()}");

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var gameSession = ApiUtils.NewGameSession(gameState);
        var controller = new GameSessionController(config, log, gameSession);

        if (playerAction.Action != "AdvanceTime" || gameState is not null)
            playerAction.Apply(controller);
        else
        {
            // kja this will be converted to "advanceTurns" route
            // If the player action is "AdvanceTime" and the gameState is null,
            // then we treat this as special case of "initialize game session to initial game state",
            // hence we just return gameSession.CurrentGameState.
        }

        JsonHttpResult<GameState> result =
            ApiUtils.ToJsonHttpResult(gameSession.CurrentGameState);
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