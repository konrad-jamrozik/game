using NSwag.Generation;
using UfoGameLib.Api;

// Start building Minimal API.
// Mentioned in:
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview?view=aspnetcore-8.0
var builder = WebApplication.CreateBuilder(args);

// Required to generate OpenAPI specs, which are used by NSwag to generate Swagger UI.
// Mentioned in:
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-8.0
builder.Services.AddEndpointsApiExplorer();

// The NSwag configuration.
// Mentioned in:
// https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-nswag?view=aspnetcore-8.0&tabs=visual-studio#add-and-configure-swagger-middleware
builder.Services.AddOpenApiDocument(
    settings =>
    {
        settings.Title = "UFO Game API";
        // Using my own EmptySchemaGenerator as it is too hard to adjust generation of OpenAPI schemas in NSwag.
        //
        // To see how it was achieved in Swashbuckle, see:
        // https://github.com/konrad-jamrozik/game/blob/lib_milestone_10/src/api/GameStateSchemaFilter.cs
        // https://github.com/konrad-jamrozik/game/blob/lib_milestone_10/src/api/Program.cs#L28
        //
        // For my failed approaches in using NSwag, see my OneNote "NSwag approaches to customizing generated schema"
        // But in short:
        // - Using TypeMappers would be a lot of work
        // - Schema processors are useless as it is not possible to replace generated schemas,
        //   and it is hard (but at least possible) to work with schema properties
        // - Using own schema generator would be a lot of work and unclear how to do it right
        settings.SchemaGeneratorFactory = () => new EmptySchemaGenerator(new OpenApiDocumentGeneratorSettings());
    });


string? localhostCorsPolicyName = null;
// Doc on ASP.NET Core environments:
// https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-8.0
if (builder.Environment.IsDevelopment())
{
    localhostCorsPolicyName = UseCorsForLocalhost(builder);
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // See comment for "UseCorsForLocalhost"
    // Also mentioned in:
    // https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0#cors-with-named-policy-and-middleware
    app.UseCors(localhostCorsPolicyName!);
}

// Required by NSwag.
// Mentioned in:
// https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-nswag?view=aspnetcore-8.0&tabs=visual-studio#add-and-configure-swagger-middleware
app.UseOpenApi();

// Required by NSwag.
// Mentioned in:
// https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-nswag?view=aspnetcore-8.0&tabs=visual-studio#add-and-configure-swagger-middleware
app.UseSwaggerUi();

new WebApplicationRoutes().Register(app);

app.Run();
return;

// See /docs/cors/cors.md
// Among others, that doc mentions:
// https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0
string UseCorsForLocalhost(WebApplicationBuilder builder)
{
    string corsPolicyName = "localhostCorsPolicy";
    // Note that 5173 spells "VITE" [1] and is this default value:
    // https://vitejs.dev/config/server-options.html#server-port
    // [1] https://www.reddit.com/r/programming/comments/xh1vyr/fun_fact_vites_default_port_is_5173_which_spells/
    string viteDefaultServerPort = "5173";
    string webNpmRunDevServerUrl = $"http://localhost:{viteDefaultServerPort}";
    // Mentioned in:
    // https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0#cors-with-named-policy-and-middleware
    builder.Services.AddCors(
        options =>
        {
            options.AddPolicy(
                name: corsPolicyName,
                policy =>
                {
                    policy
                        .WithOrigins(webNpmRunDevServerUrl)
                        .WithMethods("PUT", "DELETE", "GET", "POST");
                });
        });
    return corsPolicyName;
}


