using System.Diagnostics;
using Namotion.Reflection;
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
        Console.Out.WriteLine($"MyGen.Generate: {contextualType.Type.Name}");
        base.Generate(schema, contextualType, schemaResolver);
    }
}