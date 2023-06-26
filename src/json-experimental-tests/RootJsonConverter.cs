using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

class RootJsonConverter : JsonConverter<Root>
{
    private readonly JsonSerializerOptions _serializationOptions;

    public RootJsonConverter(JsonSerializerOptions serializationOptions)
    {
        _serializationOptions = serializationOptions;
        Debug.Assert(_serializationOptions.ReferenceHandler != ReferenceHandler.Preserve);
    }

    public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
    {
        JsonNode node = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
        ((JsonArray)node["Branches"]!).ToList().ForEach(
            branch =>
            {
                JsonObject branchObj = branch!.AsObject();
                // Note here is the magic sauce: given leaf is, INCORRECTLY,
                // serialized twice: as member of leaves List as well as here, as NestedLeaf of given branch.
                // To fix this, we replace the NestedLeaf duplicate with its ID, which will be used
                // during deserialization to replace the ID with the leaf instance deserialized
                // from leaves List.
                int id = branchObj["NestedLeaf"]!["Id"]!.GetValue<int>();
                branchObj.Add("$id_NestedLeaf", id);
                branchObj.Remove("NestedLeaf");
            });
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
}