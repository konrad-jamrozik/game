using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

class RootJsonConverter2 : JsonConverter<Root>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public RootJsonConverter2(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
    }


    public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
    {
        JsonNode node = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        SerializeObjArrayWithRefs(node, "Branches", "NestedLeaf");
        node.WriteTo(writer, _serializationOptions);
    }

    public override Root Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        JsonNode rootNode = JsonNode.Parse(ref reader)!;
        List<Leaf> leaves = rootNode["Leaves"].Deserialize<List<Leaf>>(_serializationOptions)!;

        List<Branch> branches = DeserializeObjArrayWithRefs<Branch, Leaf>(
            parent: rootNode,
            objArrayName: "Branches",
            refPropName: "NestedLeaf",
            dependencies: leaves,
            targetCtor: (id, leaf) => new Branch(id, leaf));

        int rootId = rootNode["Id"]!.GetValue<int>();
        Root root = new Root(rootId, branches, leaves);
        return root;
    }

    private void SerializeObjArrayWithRefs(JsonNode parent, string objArrayName, string propName)
    {
        ((JsonArray)parent[objArrayName]!).ToList().ForEach(
            arrayItem =>
            {
                SerializeObjWithRef(arrayItem!.AsObject(), propName);
            });
    }

    private void SerializeObjWithRef(JsonObject obj, string propName)
    {
        int id = obj[propName]!["Id"]!.GetValue<int>();
        obj.Add("$id_" + propName, id);
        obj.Remove(propName);
    }

    private List<TTarget> DeserializeObjArrayWithRefs<TTarget, TDependency>(
        JsonNode parent,
        string objArrayName,
        string refPropName,
        List<TDependency> dependencies,
        Func<int, TDependency, TTarget> targetCtor) where TDependency : IIdentifiable
    {
        JsonArray objArray = parent[objArrayName]!.AsArray();
        Dictionary<int, TDependency> dependenciesById = dependencies.ToDictionary(dep => dep.Id);

        List<TTarget> targets = objArray
            .Select(obj => DeserializeObjWithRef(obj!, dependenciesById, refPropName, targetCtor))
            .ToList();
        return targets;
    }

    private static TTarget DeserializeObjWithRef<TTarget, TDependency>(
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
}