using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

class RootJsonConverter2 : JsonConverterSupportingReferences<Root>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public RootJsonConverter2(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
        Debug.Assert(_serializationOptions.ReferenceHandler != ReferenceHandler.Preserve);
    }
    
    public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
    {
        JsonNode rootNode = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        
        ReplaceArrayObjectsPropertiesWithRefs(
            parent: rootNode,
            objArrayName: "Branches",
            propName: "NestedLeaf");

        rootNode.WriteTo(writer, _serializationOptions);
    }

    public override Root Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode rootNode = Node(ref reader);

        List<Leaf> leaves = DeserializeList<Leaf>(rootNode, "Leaves", _serializationOptions);

        List<Branch> branches = DeserializeObjectArrayWithRefProps<Branch, Leaf>(
            parent: rootNode,
            objArrayName: "Branches",
            refPropName: "NestedLeaf",
            dependencies: leaves,
            targetCtor: (id, leaf) => new Branch(id, leaf));

        Root root = new Root(Id(rootNode), branches, leaves);

        return root;
    }
}