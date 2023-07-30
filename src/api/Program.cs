using Lib.Json;
using UfoGameLib.Lib;
using UfoGameLib.State;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet(
        "/helloCoinFlip",
        () =>
        {
            var randomGen = new RandomGen(new Random());
            return $"Hello World! Coin flip: {randomGen.FlipCoin()}";
        })
    .WithName("HelloCoinFlip")
    .WithOpenApi();

app.MapGet("/initialGameState", () =>
{
    var gameSession = new GameSession(new RandomGen(new Random()));
    string gameStateJson = gameSession.CurrentGameState.ToIndentedUnsafeJsonString(GameSession.StateJsonSerializerOptions);
    return gameStateJson;
})
    .WithName("InitialGameState")
    .WithOpenApi();

app.MapGet(
        "/initialGameStateAsObj",
        () =>
        {
            var gameSession = new GameSession(new RandomGen(new Random()));
            // This should be serialized to JSON per:
            // https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio#return-values
            // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-8.0#configure-json-serialization-options-for-an-endpoint
            return TypedResults.Json(gameSession.CurrentGameState, GameSession.StateJsonSerializerOptions);
        })
    .WithName("InitialGameStateAsObj")
    .WithOpenApi()
    .Produces<GameState>();

app.Run();
