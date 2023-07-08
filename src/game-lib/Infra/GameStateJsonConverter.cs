using System.Text.Json;
using System.Text.Json.Nodes;
using Lib.Json;
using UfoGameLib.Model;

namespace UfoGameLib.Infra;

class GameStateJsonConverter : JsonConverterSupportingReferences<GameState>
{
    public GameStateJsonConverter() : base(JsonSerializerOptions())
    {
    }

    public static JsonSerializerOptions JsonSerializerOptions()
        => new(JsonExtensions.SerializerOptionsIndentedUnsafe)
        {
            IncludeFields = true
        };

    public override void Write(Utf8JsonWriter writer, GameState value, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = JsonSerializer.SerializeToNode(value, SerializationOptions)!;
        
        ReplaceArrayObjectsPropertiesWithRefs(
            parent: gameStateNode,
            objJsonArrayName: nameof(GameState.Missions),
            propName: nameof(Mission.Site));

        gameStateNode.WriteTo(writer, SerializationOptions);
    }

    public override GameState Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = JsonNode(ref reader);

        int updateCount = Int(gameStateNode, nameof(GameState.UpdateCount));
        Timeline timeline = Deserialize<Timeline>(gameStateNode);
        Assets assets = Deserialize<Assets>(gameStateNode);
        MissionSites missionSites = Deserialize<MissionSites>(gameStateNode);

        var missions = new Missions(
            DeserializeObjArrayWithDepRefProps(
                objJsonArray: JsonArray(gameStateNode, nameof(GameState.Missions)),
                depRefPropName: nameof(Mission.Site),
                missionSites,
                (_, missionSite) => new Mission(missionSite)));

        GameState gameState = new GameState(
            updateCount,
            timeline,
            assets,
            missionSites,
            missions);

        return gameState;
    }
}