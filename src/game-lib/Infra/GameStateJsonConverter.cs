using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Lib.Json;
using UfoGameLib.Model;

namespace UfoGameLib.Infra;

// kja REFACTOR. First experimental working implementation
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
            objArrayName: nameof(GameState.Missions),
            propName: nameof(Mission.Site));

        gameStateNode.WriteTo(writer, _serializationOptions);
    }

    public override GameState Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = Node(ref reader);

        int updateCount = gameStateNode[nameof(GameState.UpdateCount)]!.GetValue<int>();
        Timeline timeline = gameStateNode[nameof(GameState.Timeline)].Deserialize<Timeline>(options)!;
        Assets assets = gameStateNode[nameof(GameState.Assets)].Deserialize<Assets>(options)!;
        MissionSites missionSites = gameStateNode[nameof(GameState.MissionSites)].Deserialize<MissionSites>(options)!;

        Dictionary<int, MissionSite> missionSitesById = missionSites.ToDictionary(site => site.Id);
        JsonArray missionsArray = gameStateNode[nameof(GameState.Missions)]!.AsArray();

        var missions = new Missions(
            missionsArray.Select(
                missionNode => new Mission(site: GetByRef(missionNode!, missionSitesById, nameof(Mission.Site)))));

        GameState gameState = new GameState(
            updateCount,
            timeline,
            assets,
            missionSites,
            missions);

        return gameState;
    }
}