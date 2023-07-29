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


app.Run();
