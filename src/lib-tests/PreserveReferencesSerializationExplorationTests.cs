using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;

namespace Lib.Tests;

// See also my personal OneNote, relevant subsection of "System.Text.Json"
public class PreserveReferencesSerializationExplorationTests
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
    public void ThrowsExceptionOnDeserializingPreservedReferencesUsingCtor()
    {
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        byte[] bytes = SerializeAndReadBytes(root, OptionsPreservingReferences);

        Assert.Throws<NotSupportedException>(() => JsonSerializer.Deserialize<Root>(bytes, OptionsPreservingReferences));
    }

    [Test]
    public void DeserializesPreservedReferencesUsingInitProps()
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

    // kja curr TDD test DeserializesPreservedReferencesUsingCtorAndCustomConverter
    [Test]
    public void DeserializesPreservedReferencesUsingCtorAndCustomConverter()
    {
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        var options = new JsonSerializerOptions
        {
            Converters = { new RootJsonConverter(serializationOptions: Options) }
        };

        byte[] bytes = SerializeAndReadBytes(root, options);

        Root deserializedRoot = JsonSerializer.Deserialize<Root>(bytes, options)!;
        Assert.That(deserializedRoot.Branches[1].NestedLeaf.Id, Is.EqualTo(1));
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

        public override Root? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var root = JsonSerializer.Deserialize<Root>(ref reader, _serializationOptions);
            return root;
        }

        public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
        {
            // kja curr work: need to serialize references as appropriate to dedup
            writer.WriteRawValue(JsonSerializer.Serialize(value, _serializationOptions));
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