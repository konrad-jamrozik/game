using Lib.OS;
using UfoGameLib.Api;
using UfoGameLib.Controller;
using UfoGameLib.Lib;
using UfoGameLib.Players;
using UfoGameLib.State;
using Unchase.Swashbuckle.AspNetCore.Extensions.Extensions;

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

        // Make enums be generated with names instead of ints, per "Fix enums in OpenApi document" in
        // https://github.com/unchase/Unchase.Swashbuckle.AspNetCore.Extensions#extensions-filters-use
        // Linked from https://github.com/domaindrivendev/Swashbuckle.AspNetCore#community-packages
        opts.AddEnumsWithValuesFixFilters();

        // Apply various fixups to default OpenAPI schema generation.
        // https://github.com/domaindrivendev/Swashbuckle.AspNetCore#schema-filters
        opts.SchemaFilter<GameStateSchemaFilter>();
    });

// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-8.0
string? localhostCorsPolicyName = null;
if (builder.Environment.IsDevelopment())
    localhostCorsPolicyName = UseCorsForLocalhost(builder);

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.UseCors(localhostCorsPolicyName!);

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

app.MapGet(
    "/simulateGameSession",
    (int? turnLimit, bool? includeAllStates) =>
    {
        int turnLimitVal = turnLimit ?? 30;
        int turnLimitLowerBound = 1;
        int turnLimitUpperBound = 300;
        if (turnLimitVal < turnLimitLowerBound || turnLimitVal > turnLimitUpperBound)
            return Results.BadRequest(
                $"Value of 'turnLimit' is out of accepted range. " +
                $"It should be between {turnLimitLowerBound} and {turnLimitUpperBound}. " +
                $"Actual value: {turnLimitVal}");

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
        async (HttpContext context) =>
        {
            if (context.Request.HasJsonContentType())
            {
                // Deserialization handling as explained by:
                // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-8.0#configure-json-deserialization-options-for-an-endpoint
                var gs = await context.Request.ReadFromJsonAsync<GameState>(GameState.StateJsonSerializerOptions);
                Console.WriteLine($"gs: {gs?.ToJsonString()}");

                return TypedResults.Json(gs, GameState.StateJsonSerializerOptions);
            }
            else
            {
                return Results.BadRequest();
            }
        })
    .WithOpenApi()
    .WithTags("GameSession")
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
