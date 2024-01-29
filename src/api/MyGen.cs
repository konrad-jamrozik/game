using System.Diagnostics;
using Namotion.Reflection;
using NJsonSchema;
using NJsonSchema.Generation;
using NSwag.Generation;

namespace UfoGameLib.Api;

public class MyGen : OpenApiSchemaGenerator
{
    public MyGen(OpenApiDocumentGeneratorSettings settings) : base(settings)
    {
    }


    public override void Generate<TSchemaType>(TSchemaType schema, ContextualType contextualType, JsonSchemaResolver schemaResolver)
    {
        bool hasSchema = schemaResolver.HasSchema(contextualType.Type, false);
        Console.Out.WriteLine($"MyGen.Generate: ${typeof(TSchemaType)} {contextualType.Type.Name}. Has schema? {hasSchema}");
        if (!hasSchema)
            schemaResolver.AddSchema(contextualType.Type, false, new JsonSchema
            {
                Type = JsonObjectType.None
            });
        base.Generate(schema, contextualType, schemaResolver);
    }
}