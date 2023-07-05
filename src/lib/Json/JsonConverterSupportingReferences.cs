using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Lib.Json;

public abstract class JsonConverterSupportingReferences<T> : JsonConverter<T>
{
    protected void ReplaceArrayObjectsPropertiesWithRefs(JsonNode parent, string objArrayName, string propName)
    {
        ((JsonArray)parent[objArrayName]!).ToList().ForEach(
            arrayItem => { ReplaceObjectPropertyWithRef(arrayItem!.AsObject(), propName); });
    }

    private void ReplaceObjectPropertyWithRef(JsonObject obj, string propName)
    {
        int id = obj[propName]!["Id"]!.GetValue<int>();
        obj.Add("$id_" + propName, id);
        obj.Remove(propName);
    }

    protected List<TTarget> DeserializeObjectArrayWithRefProps<TTarget, TDependency>(
        JsonNode parent,
        string objArrayName,
        string refPropName,
        List<TDependency> dependencies,
        Func<int, TDependency, TTarget> targetCtor) where TDependency : IIdentifiable
    {
        JsonArray objArray = parent[objArrayName]!.AsArray();
        Dictionary<int, TDependency> dependenciesById = dependencies.ToDictionary<TDependency, int>(dep => dep.Id);

        List<TTarget> targets = objArray
            .Select(obj => DeserializeObjWithRefProp(obj!, dependenciesById, refPropName, targetCtor))
            .ToList();
        return targets;
    }

    private static TTarget DeserializeObjWithRefProp<TTarget, TDependency>(
        JsonNode obj,
        Dictionary<int, TDependency> dependenciesById,
        string refPropName,
        Func<int, TDependency, TTarget> targetCtor) where TDependency : IIdentifiable
    {
        int refPropId = obj["$id_" + refPropName]!.GetValue<int>();
        TDependency dep = dependenciesById[refPropId];
        int objId = obj["Id"]!.GetValue<int>();
        return targetCtor(objId, dep);
    }

    protected JsonNode Node(ref Utf8JsonReader reader)
        => JsonNode.Parse(ref reader)!;

    protected List<T> DeserializeList<T>(JsonNode parent, string propName, JsonSerializerOptions options)
        => parent[propName].Deserialize<List<T>>(options)!;

    protected int Id(JsonNode node) 
        =>  node["Id"]!.GetValue<int>();
}