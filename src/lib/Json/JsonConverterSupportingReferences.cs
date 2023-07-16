using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Lib.Json;

/// <summary>
/// This converter extracts generic abstractions out of GameStateJsonConverter.
/// See that converter for details.
/// </summary>
public abstract class JsonConverterSupportingReferences<T> : JsonConverter<T>
{
    protected readonly JsonSerializerOptions SerializationOptions;

    protected JsonConverterSupportingReferences(JsonSerializerOptions serializationOptions)
    {
        SerializationOptions = serializationOptions;
        Debug.Assert(SerializationOptions.ReferenceHandler != ReferenceHandler.Preserve);
    }

    protected static List<TObj> DeserializeObjArrayWithDepRefProps<TObj, TDep>(
        JsonArray objJsonArray,
        string depRefPropName,
        List<TDep> deps,
        Func<JsonNode, TDep?, TObj> objCtor) where TDep : IIdentifiable
    {
        Dictionary<int, TDep> depsById = deps.ToDictionary<TDep, int>(dep => dep.Id);

        List<TObj> objs = objJsonArray
            .Select<JsonNode?, TObj>(
                objJsonNode => DeserializeObjWithDepRefProp(objJsonNode!, depsById, depRefPropName, objCtor))
            .ToList();
        return objs;
    }

    protected void ReplaceArrayObjectsPropertiesWithRefs(JsonNode parent, string objJsonArrayName, string propName)
    {
        ((JsonArray)parent[objJsonArrayName]!).ToList().ForEach(
            arrayItem => { ReplaceObjectPropertyWithRef(arrayItem!.AsObject(), propName); });
    }

    
    protected TItem Deserialize<TItem>(JsonNode parent)
        => parent[typeof(TItem).Name].Deserialize<TItem>(SerializationOptions)!;

    protected TItem Deserialize<TItem>(JsonNode parent, string name)
        => parent[name].Deserialize<TItem>(SerializationOptions)!;

    protected List<TItem> DeserializeList<TItem>(JsonNode parent, string propName)
        => parent[propName].Deserialize<List<TItem>>(SerializationOptions)!;

    protected JsonNode JsonNode(ref Utf8JsonReader reader)
        => System.Text.Json.Nodes.JsonNode.Parse(ref reader)!;

    protected JsonArray JsonArray(JsonNode node, string propName)
        => node[propName]!.AsArray();

    protected int Id(JsonNode node) 
        => node["Id"]!.GetValue<int>();

    protected int DeserializeInt(JsonNode node, string propName)
        => node[propName]!.GetValue<int>();

    private void ReplaceObjectPropertyWithRef(JsonObject obj, string propName)
    {
        // This may hold:
        //     obj[propName] == null
        // when, for example, replacing Agent.CurrentMission with its ID reference.
        // The Agent.CurrentMission may be null if the Agent is not on any mission.
        int? id = obj[propName] != null ? IdFromObjPropName() : null;
        obj.Add("$id_" + propName, id);
        obj.Remove(propName);

        int? IdFromObjPropName()
        {
            JsonNode idNode =
                obj[propName]!["Id"]
                ?? throw new InvalidOperationException($"obj[{propName}]![\"Id\"] is null. obj: {obj}");
            return idNode.GetValue<int>();
        }
    }

    private static TObj DeserializeObjWithDepRefProp<TObj, TDep>(
        JsonNode objJsonNode,
        Dictionary<int, TDep> depsById,
        string depRefPropName,
        Func<JsonNode, TDep?, TObj> objCtor) where TDep : IIdentifiable
    {
        TDep? dep = GetByRef(objJsonNode, depsById, depRefPropName);
        return objCtor(objJsonNode, dep);
    }

    private static TDep? GetByRef<TDep>(JsonNode node, Dictionary<int, TDep> depsById, string refPropName)
    {
        JsonNode? refValNode = node["$id_" + refPropName];
        if (refValNode == null)
            // This is for deserializing the null ID reference as explained in
            // ReplaceObjectPropertyWithRef
            return default;

        int refPropId = refValNode.GetValue<int>();
        TDep dep = depsById[refPropId];
        return dep;
    }
}