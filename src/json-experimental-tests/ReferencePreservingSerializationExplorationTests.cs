using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

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

    /// <summary>
    /// Given:
    ///   An object (here: new Leaf(10, "abc")) in an object graph appears twice (or more)
    ///   AND
    ///   That object graph is serialized with
    ///     JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve
    /// When:
    ///   That serialized object graph is deserialized
    /// Then:
    ///   The serialized object, upon deserialization will result in two distinct instances
    ///   instead of one.
    /// </summary>
    [Test]
    public void DeserializesReferencesAsDuplicates()
        => DeserializesUsingCustomConverters(
            new List<JsonConverter>(),
            expectingDuplicateReferences: true);

    // kja curr TDD test DeserializesPreservedReferencesWithRootJsonConverter
    [Test]
    public void DeserializesPreservedReferencesWithRootJsonConverter()
        => DeserializesUsingCustomConverters(
            new List<JsonConverter> { new RootJsonConverter(serializationOptions: Options) });

    private void DeserializesUsingCustomConverters(
        List<JsonConverter> converters,
        bool expectingDuplicateReferences = false)
    {

        var leaves = new List<Leaf> { new Leaf(10, "abc"), new Leaf(20, "xyz") };
        var branches = new List<Branch> { new Branch(100, leaves[0]), new Branch(200, leaves[1]) };
        var root = new Root(7, branches, leaves);
        

        var options = new JsonSerializerOptions(Options);
        // Commenting this out will cause the assert testing if the references have been preserved to fail.
        // This is because without this converted, each leaf will be serialized twice to the json:
        // - once as part of the leaves List.
        // - once as a NestedLeaf of corresponding branch in branches List.
        converters.ForEach(options.Converters.Add);

        byte[] bytes = SerializeAndReadBytes(root, options);

        Root actual = JsonSerializer.Deserialize<Root>(bytes, options)!;
        Assert.That(actual.Id, Is.EqualTo(7));
        Assert.That(actual.Leaves[0].Id, Is.EqualTo(10));
        Assert.That(actual.Branches[0].Id, Is.EqualTo(100));
        Assert.That(actual.Leaves[1].Id, Is.EqualTo(20));
        Assert.That(actual.Branches[1].Id, Is.EqualTo(200));
        // Test the references have been preserved.
        Assert.That(
            actual.Leaves[0],
            expectingDuplicateReferences
                ? Is.Not.EqualTo(actual.Branches[0].NestedLeaf)
                : Is.EqualTo(actual.Branches[0].NestedLeaf));
    }

    private byte[] SerializeAndReadBytes<T>(T root, JsonSerializerOptions options) where T : IRoot
    {
        string json = JsonSerializer.Serialize(root, options);
        File.WriteAllText(SerializedJsonFilePath, json);
        Console.Out.WriteLine($"Saved to: {Path.GetFullPath(SerializedJsonFilePath)}");
        var bytes = File.ReadAllBytes(SerializedJsonFilePath);
        return bytes;
    }
}