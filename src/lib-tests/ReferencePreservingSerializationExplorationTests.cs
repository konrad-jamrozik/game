using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using NUnit.Framework;

namespace Lib.Tests;

// See also my personal OneNote, relevant subsection of "System.Text.Json"
public class ReferencePreservingSerializationExplorationTests
{
    private const string SerializedJsonFilePath = "./temp_test_data.json";

    private static readonly JsonSerializerOptions Options = new JsonSerializerOptions
    {
        IncludeFields = true,
        WriteIndented = true,
    };

    private static readonly JsonSerializerOptions OptionsPreservingReferences = new JsonSerializerOptions(Options)
    {
        ReferenceHandler = ReferenceHandler.Preserve
    };

    [Test]
    public void ThrowsExceptionOnDeserializingPreservingReferencesUsingCtor()
    {
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        byte[] bytes = SerializeAndReadBytes(root, OptionsPreservingReferences);

        Assert.Throws<NotSupportedException>(() => JsonSerializer.Deserialize<Root>(bytes, OptionsPreservingReferences));
    }

    [Test]
    public void DeserializesPreservingReferencesUsingInitProps()
    {
        // Note that in this test we serialize Root/Branch/Leaf
        // and deserialize Root2/Branch2/Leaf2
        // Serializing Root2/Branch2/Leaf2 instead of Root/Branch/Leaf also works.
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        byte[] bytes = SerializeAndReadBytes(root, OptionsPreservingReferences);

        Root2 deserializedRoot = JsonSerializer.Deserialize<Root2>(bytes, OptionsPreservingReferences)!;
        Assert.That(deserializedRoot.Branches?[1].NestedLeaf?.Id, Is.EqualTo(1));
    }

    // kja curr TDD test DeserializesPreservingReferencesUsingCtorAndCustomConverter
    [Test]
    public void DeserializesPreservingReferencesUsingCtorAndCustomConverter()
    {
        var leaves = new List<Leaf> { new Leaf(10, "abc"), new Leaf(20, "xyz") };
        var branches = new List<Branch> { new Branch(100, leaves[0]), new Branch(200, leaves[1]) };
        var root = new Root(7, branches, leaves);

        var options = new JsonSerializerOptions(Options)
        {
            // Commenting this out will cause the assert testing if the references have been preserved to fail.
            // This is because without this converted, each leaf will be serialized twice to the json:
            // - once as part of the leaves List.
            // - once as a NestedLeaf of corresponding branch in branches List.
            Converters = { new RootJsonConverter(serializationOptions: Options) }
        };

        byte[] bytes = SerializeAndReadBytes(root, options);

        Root actual = JsonSerializer.Deserialize<Root>(bytes, options)!;
        Assert.That(actual.Id, Is.EqualTo(7));
        Assert.That(actual.Leaves[0].Id, Is.EqualTo(10));
        Assert.That(actual.Branches[0].Id, Is.EqualTo(100));
        Assert.That(actual.Leaves[1].Id, Is.EqualTo(20));
        Assert.That(actual.Branches[1].Id, Is.EqualTo(200));
        // Test the references have been preserved.
        Assert.That(actual.Leaves[0], Is.EqualTo(actual.Branches[0].NestedLeaf));
    }

    private byte[] SerializeAndReadBytes<T>(T root, JsonSerializerOptions options) where T : IRoot
    {
        string json = JsonSerializer.Serialize(root, options);
        File.WriteAllText(SerializedJsonFilePath, json);
        Console.Out.WriteLine($"Saved to: {Path.GetFullPath(SerializedJsonFilePath)}");
        var bytes = File.ReadAllBytes(SerializedJsonFilePath);
        return bytes;
    }

    private class RootJsonConverter : JsonConverter<Root>
    {
        private readonly JsonSerializerOptions _serializationOptions;

        public RootJsonConverter(JsonSerializerOptions serializationOptions)
        {
            _serializationOptions = serializationOptions;
        }

        public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
        {
            JsonNode node = JsonSerializer.SerializeToNode(value, _serializationOptions)!;
            ((JsonArray)node["Branches"]!).ToList().ForEach(
                branch =>
                {
                    // kja extract this Branch-withLeafRef construction into a nested custom converter that will take
                    // in ctor param leaf map keyed by ids (leavesById).
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
                // kja extract this Branch construction into a nested custom converter that will take
                // in ctor param leaf map keyed by ids (leavesById).
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

    private interface IRoot
    {

    }

    private class Root : IRoot
    {
        public int Id;
        public List<Branch> Branches;
        public List<Leaf> Leaves;

        public Root(int id, List<Branch> branches, List<Leaf> leaves)
        {
            Id = id;
            Branches = branches;
            Leaves = leaves;
        }
    }

    private class Branch
    {
        public int Id;
        public readonly Leaf NestedLeaf;

        public Branch(int id, Leaf nestedLeaf)
        {
            Id = id;
            NestedLeaf = nestedLeaf;
        }
    }

    private class Leaf
    {
        public readonly int Id;
        public string Value;

        public Leaf(int id, string value)
        {
            Id = id;
            Value = value;
        }
    }

    private class Root2 : IRoot
    {
        public int Id;
        public required List<Branch2>? Branches { get; init; }
        public required List<Leaf2>? Leaves { get; init; }

        public Root2()
        {}

        public Root2(int id, List<Branch2>? branches, List<Leaf2>? leaves)
        {
            Id = id;
            Branches = branches;
            Leaves = leaves;
        }
    }

    private class Branch2
    {
        public required int Id;
        public required Leaf2? NestedLeaf { get; init; }

        public Branch2()
        {
        }

        public Branch2(int id, Leaf2? nestedLeaf)
        {
            Id = id;
            NestedLeaf = nestedLeaf;
        }
    }

    private class Leaf2
    {
        public required int Id;
        public required string? Value { get; init; }

        public Leaf2()
        {
        }

        public Leaf2(int id, string? value)
        {
            Id = id;
            Value = value;
        }
    }
}