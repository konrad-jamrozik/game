using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Infra;

class GameStateJsonConverter : JsonConverterSupportingReferences<GameState>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public GameStateJsonConverter(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
        Debug.Assert(_serializationOptions.ReferenceHandler != ReferenceHandler.Preserve);
    }
    
    public override void Write(Utf8JsonWriter writer, GameState value, JsonSerializerOptions options)
    {
        JsonNode rootNode = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        
        ReplaceArrayObjectsPropertiesWithRefs(
            parent: rootNode,
            objArrayName: "Branches",
            propName: "NestedLeaf");

        rootNode.WriteTo(writer, _serializationOptions);
    }

    public override GameState Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode rootNode = Node(ref reader);

        return null!;
        //
        // List<Leaf> leaves = DeserializeList<Leaf>(rootNode, "Leaves", _serializationOptions);
        //
        // List<Branch> branches = DeserializeObjectArrayWithRefProps<Branch, Leaf>(
        //     parent: rootNode,
        //     objArrayName: "Branches",
        //     refPropName: "NestedLeaf",
        //     dependencies: leaves,
        //     targetCtor: (id, leaf) => new Branch(id, leaf));
        //
        // Root root = new Root(Id(rootNode), branches, leaves);
        //
        // return root;
    }
}