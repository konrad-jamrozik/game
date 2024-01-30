using NSwag.Generation;
using UfoGameLib.Api;

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

new WebApplicationRoutes().Register(app);

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


