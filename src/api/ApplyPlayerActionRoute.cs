using Lib.Contracts;
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

            return ApplyPlayerActionInternal(body!.PlayerActionPayload, body.GameSessionTurn);
        }
    }

    private static JsonHttpResult<GameSessionTurn> ApplyPlayerActionInternal(
        PlayerActionPayload playerActionPayload,
        GameSessionTurn gameSessionTurn)
    {
        Console.Out.WriteLine(
            $"Invoked ApplyPlayerActionInternal. " +
            $"playerActionPayload: {playerActionPayload.ToIndentedUnsafeJsonString()}, " +
            $"gameSessionTurn: {gameSessionTurn.StartState.Timeline.CurrentTurn}");

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        GameSession gameSession = ApiUtils.NewGameSessionFromTurn(gameSessionTurn);
        var controller = new GameSessionController(config, log, gameSession);

        Contract.Assert(playerActionPayload.Name.IsNotTimeAdvancement);

        gameSession.CurrentPlayerActionEvents.Add(playerActionPayload.Apply(controller));

        JsonHttpResult<GameSessionTurn> result = ApiUtils.ToJsonHttpResult(gameSession.CurrentTurn);
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
                (await req.ReadFromJsonAsync<ApplyPlayerActionRequestBody>(GameSessionTurn.JsonSerializerOptions))!;
            error = null;
        }
        else
        {
            parsedBody = null;
            error = "Expected PlayerActionPayload and GameSessionTurn to be parseable from the request JSON body";
        }

        return (parsedBody, error);
    }
}