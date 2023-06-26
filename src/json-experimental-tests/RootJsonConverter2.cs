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
        JsonArray branchesArray = rootNode["Branches"]!.AsArray();
        Dictionary<int, Leaf> leavesById = leaves.ToDictionary(leaf => leaf.Id);
        List<Branch> branches = branchesArray.Select(branch =>
        {
            int nestedLeafId = branch!["$id_NestedLeaf"]!.GetValue<int>();
            Leaf leaf = leavesById[nestedLeafId];
            int branchId = branch["Id"]!.GetValue<int>();
            // Note here is the magic sauce: instead of creating leaf duplicate here,
            // we pass the already deserialized 'leaf' instance, thus avoiding duplication.
            return new Branch(branchId, leaf);
        }).ToList();
            
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
}