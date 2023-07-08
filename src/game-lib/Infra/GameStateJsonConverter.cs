using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Lib.Json;
using UfoGameLib.Model;

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
        JsonNode gameStateNode = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        
        ReplaceArrayObjectsPropertiesWithRefs(
            parent: gameStateNode,
            objArrayName: "Missions",
            propName: "Site");

        gameStateNode.WriteTo(writer, _serializationOptions);
    }

    public override GameState Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = Node(ref reader);
        List<MissionSite> missionSites = DeserializeList<MissionSite>(gameStateNode, "MissionSites", options);
        GameState gameState = new GameState(
            updateCount: 0,
            new Timeline(currentTurn: 0),
            new Assets(currentMoney: 0, new Agents(), maxTransportCapacity: 0, currentTransportCapacity: 0),
            new MissionSites(),
            new Missions());

        return gameState;
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