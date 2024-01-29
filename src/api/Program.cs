using Lib.OS;
using Microsoft.AspNetCore.Http.HttpResults;
using NSwag.Generation;
using UfoGameLib.Api;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApiDocument(
    settings =>
    {
        settings.Title = "UFO Game API";
        settings.SchemaGeneratorFactory = () => new EmptySchemaGenerator(new OpenApiDocumentGeneratorSettings());
    });

// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-8.0
string? localhostCorsPolicyName = null;
if (builder.Environment.IsDevelopment())
    localhostCorsPolicyName = UseCorsForLocalhost(builder);

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.UseCors(localhostCorsPolicyName!);

app.UseOpenApi();
app.UseSwaggerUi();

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
            return TypedResults.Json(gameSession.CurrentGameState, GameState.StateJsonSerializerOptions);
        })
    .WithName("InitialGameState")
    .WithOpenApi()
    .Produces<GameState>();

app.MapGet(
        "/initialGameStatePlayerView",
        () =>
        {
            var gameSession = new GameSession(new RandomGen(new Random()));
            return TypedResults.Json(new GameStatePlayerView(() => gameSession.CurrentGameState), GameState.StateJsonSerializerOptions);
        })
    .WithName("InitialGameStatePlayerView")
    .WithOpenApi()
    .Produces<GameStatePlayerView>();

// Multiple response types doc:
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0#multiple-response-types
app.MapGet(
    "/simulateGameSession",
    Results<JsonHttpResult<GameStatePlayerView[]>, JsonHttpResult<GameStatePlayerView>, BadRequest<string>>
    (int? turnLimit, bool? includeAllStates) =>
    {
        int turnLimitVal = turnLimit ?? 30;
        int turnLimitLowerBound = 1;
        int turnLimitUpperBound = 300;
        if (turnLimitVal < turnLimitLowerBound || turnLimitVal > turnLimitUpperBound)
        {
            return TypedResults.BadRequest(
                $"Value of 'turnLimit' is out of accepted range. " +
                $"It should be between {turnLimitLowerBound} and {turnLimitUpperBound}. " +
                $"Actual value: {turnLimitVal}");
        }

        var config = new Configuration(new SimulatedFileSystem());
        var log = new Log(config);
        var randomGen = new RandomGen(new Random());
        var intellect = AIPlayer.Intellect.Basic;
        var controller = new GameSessionController(config, log, new GameSession(randomGen));
        var aiPlayer = new AIPlayer(log, intellect);
        controller.PlayGameSession(turnLimit: turnLimitVal, aiPlayer);

        if (includeAllStates == true)
            return TypedResults.Json(controller.AllGameStatesPlayerViews(), GameState.StateJsonSerializerOptions);
        else
            return TypedResults.Json(controller.CurrentGameStatePlayerView, GameState.StateJsonSerializerOptions);
    });

app.MapPost(
        "/simulateGameSessionFromState",
        async (HttpRequest req, HttpResponse resp, int? turnLimit) =>
        {
            if (req.HasJsonContentType())
            {
                // Deserialization handling as explained by:
                // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
                var gs = await req.ReadFromJsonAsync<GameState>(GameState.StateJsonSerializerOptions);
                Console.WriteLine($"gs: {gs?.ToJsonString()}");

                int turnLimitVal = turnLimit ?? 30;
                Console.WriteLine($"turnLimitVal: {turnLimitVal}");

                return TypedResults.Json(gs, GameState.StateJsonSerializerOptions);
            }
            else
            {
                return Results.BadRequest();
            }
        })
    .WithOpenApi()
    .Accepts<GameState>("application/json");    

app.Run();
return;

// https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0
string UseCorsForLocalhost(WebApplicationBuilder builder)
{
    string corsPolicyName = "localhostCorsPolicy";
    // Note that 5173 spells "VITE" [1] and is this default value:
    // https://vitejs.dev/config/server-options.html#server-port
    // [1] https://www.reddit.com/r/programming/comments/xh1vyr/fun_fact_vites_default_port_is_5173_which_spells/
    string viteDefaultServerPort = "5173";
    string webNpmRunDevServerUrl = $"http://localhost:{viteDefaultServerPort}";
    builder.Services.AddCors(
        options =>
        {
            options.AddPolicy(
                name: corsPolicyName,
                policy =>
                {
                    policy.WithOrigins(webNpmRunDevServerUrl)
                        .WithMethods("PUT", "DELETE", "GET");
                });
        });
    return corsPolicyName;
}


