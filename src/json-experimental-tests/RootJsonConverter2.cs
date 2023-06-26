using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

class RootJsonConverter2 : JsonConverter<object>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public RootJsonConverter2(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
    }

    public override bool CanConvert(Type typeToConvert)
    {
        if (typeToConvert.Name == "Leaf")
        {
            // kja curr work this returns no attribute because it is not on the Leaf class directly,
            // but on the Leaf member of Branch
            // Probably will need to say 'yes' when any member has this attribute, and then when actually
            // converting members without this property, do something like:
            // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/converters-how-to?pivots=dotnet-7-0
            // If given typeToConvert has no [JsonRef] members then this method should return false,
            // as it will be recursively called for each member.
            //
            // Idea 2:
            // Leverage serialization preserving references to serialize, then rewrite the serialized json
            // to nicer form.
            // Upon deserialization, have the converter read the top level root node json into
            // JsonNode or something, and then manually crawl it building types bottom-to-top,
            // instead of relying on recursive invocations of the custom converter.
            // When manually crawling and deserializing, the custom converter won't pass itself to the 
            // Deserialize call; instead, if it detects a need to deserialize a member from ID reference,
            // it will postpone it if the member hasn't been yet deserialized, or if it was, it will 
            // pass to ctor the already deserialized (ctored) member.
            //
            // Idea 3: Abandon the generic system of [JsonRef] as it would require
            // some advanced implementation of DI container: both to delay ctoring some types
            // when necessary, as well as for figuring out proper ctor to call
            // (this was also explained here: https://github.com/dotnet/runtime/issues/73302#issuecomment-1204104384)
            // Instead write a Converter that is aware of the exact domain model and knows exactly
            // which members to serialize and deserialize by reference, which ctors to call, and by which order,
            // as it is aware of all types.
            // The downside of this is that such Converter will need to be adapted
            // as the domain model changes.
            // For example, each type that has at least one member that is serialized by ref,
            // will need to have a custom converter that calls appropriate ctor passing as ctor argument
            // the object that is referenced, (and that has been ctored earlier during deserialization)
            // Plus there has to be a top-level custom converter that knows the order in which to invoke
            // all the specific-type converters, to first obtain the objects that can be obtained
            // and then start passing them to ctors requiring refs (via in-memory "id to object" map),
            // and continuing the process until entire object graph is build.

            var customAttribute = Attribute.GetCustomAttribute(typeToConvert, typeof(JsonRefAttribute));
            Console.Out.WriteLine("customAttr: " + customAttribute + " " + customAttribute?.GetType());
        }

        var yes = Attribute.GetCustomAttribute(typeToConvert, typeof(JsonRefAttribute)) is JsonRefAttribute;
        Console.Out.WriteLine($"can convert {typeToConvert.Name} ? {yes}");
        return yes;
    }

    public override void Write(Utf8JsonWriter writer, object value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
    }

    public override object Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        Console.Out.WriteLine("Reading! " + typeToConvert.Name);
        return new object();
    }
}