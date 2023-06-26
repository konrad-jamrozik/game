using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace JsonExperimental.Tests;

class RootJsonConverter2 : JsonConverterSupportingReferences<Root>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public RootJsonConverter2(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
    }
    
    public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
    {
        JsonNode node = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        ReplaceArrayObjectsPropertiesWithRefs(node, "Branches", "NestedLeaf");
        node.WriteTo(writer, _serializationOptions);
    }

    public override Root Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode rootNode = JsonNode.Parse(ref reader)!;
        List<Leaf> leaves = rootNode["Leaves"].Deserialize<List<Leaf>>(_serializationOptions)!;

        List<Branch> branches = DeserializeObjectArrayWithRefProps<Branch, Leaf>(
            parent: rootNode,
            objArrayName: "Branches",
            refPropName: "NestedLeaf",
            dependencies: leaves,
            targetCtor: (id, leaf) => new Branch(id, leaf));

        int rootId = rootNode["Id"]!.GetValue<int>();
        Root root = new Root(rootId, branches, leaves);
        return root;
    }
}