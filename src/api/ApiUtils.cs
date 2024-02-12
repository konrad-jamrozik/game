using Microsoft.AspNetCore.Http.HttpResults;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public static class ApiUtils
{
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

    public static JsonHttpResult<GameState[]> ToJsonHttpResult(GameState[] gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);

    public static JsonHttpResult<GameStatePlayerView> ToJsonHttpResult(GameStatePlayerView gs)
        => TypedResults.Json(gs, GameState.StateJsonSerializerOptions);

    private static JsonHttpResult<GameStatePlayerView[]> ToJsonHttpResult(GameStatePlayerView[] gss)
        => TypedResults.Json(gss, GameState.StateJsonSerializerOptions);


}