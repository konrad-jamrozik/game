using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Lib.Json;
using UfoGameLib.Model;

namespace UfoGameLib.State;

/// <summary>
/// This converter exists to enable saving the GameState to file system as json
/// and loading it, while maintaining following properties:
/// - no object instances are duplicated. Only one full object is serialized,
/// and all other occurrences are serialized by IDs.
/// - when deserializing, only ctors are used, so that immutability is maintained,
/// i.e. there is no need for setters
/// - when deserializing, ctors get invoked with arguments denoting some precondition
/// checks are disabled. These precondition checks check correctness of object
/// construction during normal program execution, but they may no longer hold
/// when the object is hydrated from a json save file.
///
/// See also the converter from which this converter inherits, its other
/// inheritors, and tests for them.
/// 
/// Future work:
/// Make this converter generic and attribute-based, e.g. by marking the member
/// to be serialized as a reference with a new custom JSON attribute like
/// [JsonReference] and make the converter figure out the rest by itself instead
/// of having to update the converter every time the object model changes,
/// as it is done right now.
/// This improvement could perhaps be accomplished with source-generators:
/// https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation-modes?pivots=dotnet-8-0
/// 
/// For additional context on what gap this converter fills, see:
/// https://github.com/dotnet/docs/issues/35020
/// https://github.com/dotnet/runtime/issues/73302#issuecomment-1204104384
///

/// </summary>
class GameStateJsonConverter : JsonConverterSupportingReferences<GameState>
{
    public GameStateJsonConverter() : base(JsonSerializerOptions())
    {
    }

    public static JsonSerializerOptions JsonSerializerOptions()
        => new(JsonExtensions.SerializerOptionsIndentedUnsafe)
        {
            IncludeFields = true,
            IgnoreReadOnlyFields = false,

            // Not ignoring readonly properties.
            // If they would be ignored, then there is no easy way to un-ignore
            // a property. The [JsonInclude] attribute doesn't appear to work [1].
            // This e.g. a problem for classes implementing interfaces with
            // properties. It is not possible to request a field via interface,
            // only property, which would get ignored, and then couldn't be brought
            // back via the attribute.
            // I could work around this via contract customization [2],
            // but that's a lot of extra complex code that needs to be written for each
            // property I want to un-ignore.
            //
            // Conversely, when properties aren't ignored by default, I can selectively
            // ignore properties via [JsonIgnore].
            //
            // [1] https://github.com/dotnet/runtime/issues/88716
            // [2] https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/custom-contracts
            IgnoreReadOnlyProperties = false,

            // The JsonStringEnumConverter allows serialization of enums as string instead of integers.
            // Reference:
            // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/customize-properties?pivots=dotnet-7-0#enums-as-strings
            // https://stackoverflow.com/a/58234964/986533
            Converters = { new JsonStringEnumConverter() }
        };

    public override void Write(Utf8JsonWriter writer, GameState value, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = JsonSerializer.SerializeToNode(value, SerializationOptions)!;
        
        ReplaceArrayObjectsPropertiesWithRefs(
            parent: gameStateNode,
            objJsonArrayName: nameof(GameState.Missions),
            propName: nameof(Mission.Site));

        ReplaceArrayObjectsPropertiesWithRefs(
            parent: gameStateNode[nameof(GameState.Assets)]!,
            objJsonArrayName: nameof(Assets.Agents),
            propName: nameof(Agent.CurrentMission));

        gameStateNode.WriteTo(writer, SerializationOptions);
    }

    public override GameState Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode gameStateNode = JsonNode(ref reader);

        int updateCount = DeserializeInt(gameStateNode, nameof(GameState.UpdateCount));
        Timeline timeline = Deserialize<Timeline>(gameStateNode);
        MissionSites missionSites = Deserialize<MissionSites>(gameStateNode);
        Agents terminatedAgents =
            Deserialize<List<Agent>>(gameStateNode, nameof(GameState.TerminatedAgents)).ToAgents(terminated: true);
        

        var missions = new Missions(
            DeserializeObjArrayWithDepRefProps(
                objJsonArray: JsonArray(gameStateNode, nameof(GameState.Missions)),
                depRefPropName: nameof(Mission.Site),
                deps: missionSites,
                (missionObj, missionSite)
                    => new Mission(
                        id: DeserializeInt(missionObj,nameof(Mission.Id)),
                        currentState: DeserializeEnum<Mission.State>(missionObj, nameof(Mission.CurrentState)),
                        site: missionSite!)));

        JsonNode assetsNode = gameStateNode[nameof(GameState.Assets)]!;
        var agents = new Agents(
            DeserializeObjArrayWithDepRefProps(
                objJsonArray: JsonArray(assetsNode, nameof(Assets.Agents)),
                depRefPropName: nameof(Agent.CurrentMission),
                deps: missions,
                (agentObj, mission)
                    => new Agent(
                        id: DeserializeInt(agentObj,nameof(Agent.Id)),
                        currentState: DeserializeEnum<Agent.State>(agentObj, nameof(Agent.CurrentState)),
                        currentMission: mission,
                        turnsTrained: DeserializeInt(agentObj, nameof(Agent.TurnsTrained)),
                        recoversIn: DeserializeInt(agentObj, nameof(Agent.RecoversIn)))));

        var assets = new Assets(
            money: DeserializeInt(assetsNode, nameof(Assets.Money)),
            intel: DeserializeInt(assetsNode, nameof(Assets.Intel)),
            funding: DeserializeInt(assetsNode, nameof(Assets.Funding)),
            support: DeserializeInt(assetsNode, nameof(Assets.Support)),
            currentTransportCapacity: DeserializeInt(assetsNode, nameof(Assets.CurrentTransportCapacity)),
            maxTransportCapacity: DeserializeInt(assetsNode, nameof(Assets.MaxTransportCapacity)),
            agents: agents);

        GameState gameState = new GameState(
            updateCount,
            timeline,
            assets,
            missionSites,
            missions,
            terminatedAgents);

        return gameState;
    }
}