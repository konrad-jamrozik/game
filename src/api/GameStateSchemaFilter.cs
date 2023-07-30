using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace UfoGameLib.Api;

// kja need to handle polymorphism correctly for cases like Agents, Missions, MissionSites
// https://github.com/domaindrivendev/Swashbuckle.AspNetCore#inheritance-and-polymorphism
// Currently, this causes a lot of extra junk in Swagger UI, in "Schemas" section.
// kja try to dedup the dependency of this filter on UfoGameLib.State.GameSession.StateJsonSerializerOptions.
/// <summary>
/// This schema filter ensures that OpenAPI schema generated from C# classes includes the same
/// fields and properties as determined by UfoGameLib.State.GameSession.StateJsonSerializerOptions.
/// </summary>
// ReSharper disable once ClassNeverInstantiated.Global
// Reason: used as opts.SchemaFilter<IncludePropertiesAndFieldsSchemaFilter>();
public class GameStateSchemaFilter : ISchemaFilter
{
    private readonly HashSet<Type> _processedTypes = new HashSet<Type>();

    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (_processedTypes.Contains(context.Type)) 
            return;

        _processedTypes.Add(context.Type);

        Type? type = context.Type;

        schema.Properties ??= new Dictionary<string, OpenApiSchema>();

        MemberInfo[] members = type.GetMembers(BindingFlags.Public | BindingFlags.Instance);

        foreach (MemberInfo member in members)
        {
            // Skip members with [JsonIgnore] attribute
            if (IsJsonIgnore(member))
                continue;

            // Include public properties and public fields.
            if (member is PropertyInfo propertyInfo)
            {
                Console.Out.WriteLine($"Processing Prop  {type}.{member.Name}");
                schema.Properties[propertyInfo.Name] = context.SchemaGenerator.GenerateSchema(
                    propertyInfo.PropertyType,
                    context.SchemaRepository);

                RemoveLowerCasedKey(schema, propertyInfo);
            }
            else if (member is FieldInfo fieldInfo)
            {
                Console.Out.WriteLine($"Processing Field {type}.{member.Name}");
                schema.Properties[fieldInfo.Name] = context.SchemaGenerator.GenerateSchema(
                    fieldInfo.FieldType,
                    context.SchemaRepository);

                RemoveLowerCasedKey(schema, fieldInfo);
            }
            else
            {
                // Do not include other member kinds.
                if (schema.Properties.ContainsKey(member.Name))
                {
                    Console.Out.WriteLine($"Removed other {type}.{member.Name}");
                    schema.Properties.Remove(member.Name);
                }
            }
        }
    }

    private static bool IsJsonIgnore(MemberInfo member)
        => member.GetCustomAttribute<JsonIgnoreAttribute>() != null;

    private static void RemoveLowerCasedKey(OpenApiSchema schema, MemberInfo memberInfo)
    {
        string nameWithLower = ToLowerFirstChar(memberInfo.Name);
        if (schema.Properties.ContainsKey(nameWithLower))
        {
            Console.Out.WriteLine($"Removed lower {memberInfo.DeclaringType}.{memberInfo.Name}");
            schema.Properties.Remove(nameWithLower);
        }
    }

    private static string ToLowerFirstChar(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return char.ToLower(input[0]) + input.Substring(1);
    }
}