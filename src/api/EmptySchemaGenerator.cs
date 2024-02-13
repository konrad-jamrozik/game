using Namotion.Reflection;
using NJsonSchema;
using NJsonSchema.Generation;
using NSwag.Generation;
using UfoGameLib.State;

namespace UfoGameLib.Api;

public class EmptySchemaGenerator : OpenApiSchemaGenerator
{
    private static readonly string[] PrimitiveTypes = ["Boolean", "String", "Int32"];

    public EmptySchemaGenerator(OpenApiDocumentGeneratorSettings settings) : base(settings)
    {
    }

    public override void Generate<TSchemaType>(
        TSchemaType schema,
        ContextualType contextualType,
        JsonSchemaResolver schemaResolver)
    {
        string typeName = contextualType.Type.Name;

        bool hasSchema = schemaResolver.HasSchema(contextualType.Type, false);
        if (!hasSchema)
        {
            if (!PrimitiveTypes.Contains(typeName))
            {
                Console.Out.WriteLine(
                    $"EmptySchemaGenerator.Generate: overriding type '{typeName}' JsonSchema with an empty one.");
                schemaResolver.AddSchema(
                    contextualType.Type,
                    isIntegerEnumeration: false,
                    new JsonSchema
                    {
                        Type = JsonObjectType.None,
                        Example = GetSchemaExample(typeName)
                    });
            }
        }

        base.Generate(schema, contextualType, schemaResolver);
    }

    private static string? GetSchemaExample(string typeName)
        => typeName switch
        {
            nameof(GameState) => "Call '/initialGameState' to obtain example value of GameState",
            nameof(ApplyPlayerActionRequestBody) => "{ 'GameState': {...}, 'PlayerAction': {...} }",
            _ => null
        };
}