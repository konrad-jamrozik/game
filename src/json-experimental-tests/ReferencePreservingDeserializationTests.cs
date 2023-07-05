using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

// See also my personal OneNote, relevant subsection of "System.Text.Json"
public class ReferencePreservingDeserializationTests
{
    /// <summary>
    /// Given:
    ///   An object (here: new Leaf(10, "abc")) in an object graph appears twice (or more)
    ///   AND
    ///   That object graph is serialized with
    ///     JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve
    /// When:
    ///   That serialized object graph is deserialized
    /// Then:
    ///   The serialized object, upon deserialization, will result in two distinct instances
    ///   instead of one.
    /// </summary>
    [Test]
    public void DeserializingResultsInDuplicateInstances()
        => VerifyDeserialization(
            new List<JsonConverter>(),
            expectingDuplicateReferences: true);

    /// <summary>
    /// Given:
    ///   An object (here: new Leaf(10, "abc")) in an object graph appears twice (or more)
    ///   AND
    ///   That object graph is serialized using RootJsonConverter
    /// When:
    ///   That serialized object graph is deserialized
    /// Then:
    ///   The serialized object, upon deserialization, will result in one instance.
    /// </summary>
    [Test]
    public void DeserializingWithRootJsonConverterPreservesReferences()
        => VerifyDeserialization(
            new List<JsonConverter>
                { new RootJsonConverter(serializationOptions: JsonSerializerOptionsLibrary.BaseOptions) });

    /// <summary>
    /// Given:
    ///   An object (here: new Leaf(10, "abc")) in an object graph appears twice (or more)
    ///   AND
    ///   That object graph is serialized using RootJsonConverter2
    /// When:
    ///   That serialized object graph is deserialized
    /// Then:
    ///   The serialized object, upon deserialization, will result in one instance.
    /// </summary>
    [Test]
    public void DeserializingWithRootJsonConverter2PreservesReferences()
        => VerifyDeserialization(
            new List<JsonConverter>
                { new RootJsonConverter2(serializationOptions: JsonSerializerOptionsLibrary.BaseOptions) });

    private void VerifyDeserialization(
        List<JsonConverter> converters,
        bool expectingDuplicateReferences = false)
    {

        var leaves = new List<Leaf> { new Leaf(10, "abc"), new Leaf(20, "xyz") };
        var branches = new List<Branch> { new Branch(100, leaves[0]), new Branch(200, leaves[1]) };
        var root = new Root(7, branches, leaves);

        var options = new JsonSerializerOptions(JsonSerializerOptionsLibrary.BaseOptions);
        // Commenting this out will cause the assert testing if the references have been preserved to fail.
        // This is because without this converter, each leaf will be serialized twice to the json:
        // - once as part of the leaves List.
        // - once as a NestedLeaf of corresponding branch in branches List.
        converters.ForEach(options.Converters.Add);

        byte[] bytes = TestsUtils.SerializeAndReadBytes(root, options);

        Root actual = JsonSerializer.Deserialize<Root>(bytes, options)!;
        Assert.That(actual.Id, Is.EqualTo(7));
        Assert.That(actual.Leaves[0].Id, Is.EqualTo(10));
        Assert.That(actual.Branches[0].Id, Is.EqualTo(100));
        Assert.That(actual.Leaves[1].Id, Is.EqualTo(20));
        Assert.That(actual.Branches[1].Id, Is.EqualTo(200));
        // Test the references have been preserved,
        // i.e. no duplicate object instances have been introduced.
        Assert.That(
            actual.Leaves[0],
            expectingDuplicateReferences
                ? Is.Not.SameAs(actual.Branches[0].NestedLeaf)
                : Is.SameAs(actual.Branches[0].NestedLeaf));
    }
}