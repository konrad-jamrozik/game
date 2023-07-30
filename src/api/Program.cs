using UfoGameLib.Api;
using UfoGameLib.Lib;
using UfoGameLib.State;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    opts =>
    {
        // Not sure if I need these, but they seem like a good idea.
        // https://github.com/domaindrivendev/Swashbuckle.AspNetCore#inheritance-and-polymorphism
        opts.UseAllOfForInheritance();
        opts.UseAllOfToExtendReferenceSchemas();
        opts.UseOneOfForPolymorphism();

        // Apply various fixups to default OpenAPI schema generation.
        // https://github.com/domaindrivendev/Swashbuckle.AspNetCore#schema-filters
        opts.SchemaFilter<GameStateSchemaFilter>();
    });

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

app.MapGet(
        "/initialGameState",
        () =>
        {
            var gameSession = new GameSession(new RandomGen(new Random()));
            // This should be serialized to JSON per:
            // https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0&tabs=visual-studio#return-values
            // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-8.0#configure-json-serialization-options-for-an-endpoint
            return TypedResults.Json(gameSession.CurrentGameState, GameSession.StateJsonSerializerOptions);
        })
    .WithName("InitialGameState")
    .WithOpenApi()
    .Produces<GameState>();

app.MapGet(
        "/initialGameStatePlayerView",
        () =>
        {
            var gameSession = new GameSession(new RandomGen(new Random()));
            return TypedResults.Json(new GameStatePlayerView(gameSession), GameSession.StateJsonSerializerOptions);
        })
    .WithName("InitialGameStatePlayerView")
    .WithOpenApi()
    .Produces<GameStatePlayerView>();

// app.MapGet(
//     "/exampleSession",
//     () =>
//     {
//         // kja to make this work, see: UfoGameLib.Tests.AIPlayerTests.ExampleGameSessionForApi
//         var config = new Configuration(new SimulatedFileSystem());
//         var log = new Log(config);
//         var randomGen = new RandomGen(new Random());
//         var intellect = AIPlayer.Intellect.Basic;
//         var controller = new GameSessionController(config, log, new GameSession(randomGen));
//         var aiPlayer = new AIPlayer(log, intellect);
//
//         // Act
//         controller.PlayGameSession(turnLimit: 30, aiPlayer);
//
//         return TypedResults.Json(controller.GameStatePlayerView, GameSession.StateJsonSerializerOptions);
//     });

app.Run();
