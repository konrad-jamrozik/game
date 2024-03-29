﻿using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public class WebApplicationRoutes
{
    public void Register(WebApplication app)
    {
        app.MapGet("/helloCoinFlip", HelloCoinFlip)
            .WithTags("API");

        app.MapGet("/initialGameState", () => ApiUtils.GetCurrentStateResponse(ApiUtils.NewGameSession()))
            .Produces<GameState>()
            .WithTags("API");

        app.MapGet(
                "/initialGameStatePlayerView",
                () => ApiUtils.GetCurrentStatePlayerViewResponse(ApiUtils.NewGameSession()))
            .Produces<GameStatePlayerView>()
            .WithTags("API");

        app.MapPost("/advanceTurns", AdvanceTurnsRoute.AdvanceTurns)
            .Accepts<GameState>("application/json")
            .Produces<GameState>()
            .WithTags("API");

        app.MapPost("/applyPlayerAction", ApplyPlayerActionRoute.ApplyPlayerAction)
            .Accepts<ApplyPlayerActionRequestBody>("application/json")
            .Produces<GameState>()
            .WithTags("API");
    }

    private static string HelloCoinFlip()
    {
        var randomGen = new RandomGen(new Random());
        return $"Hello World! Coin flip: {randomGen.FlipCoin()}";
    }
}