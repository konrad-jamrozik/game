using System;
using System.Collections.Generic;
using System.Text.Json;

namespace JsonExperimental.Tests;

public class ReferencePreservingReferenceHandlerTests
{
    [Test]
    public void ThrowsExceptionOnDeserializingPreservingReferencesUsingCtor()
    {
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        byte[] bytes = JsonSerializationTestsLibrary.SerializeAndReadBytes(root, JsonSerializationTestsLibrary.OptionsPreservingReferences);

        Assert.Throws<NotSupportedException>(() => JsonSerializer.Deserialize<Root>(bytes, JsonSerializationTestsLibrary.OptionsPreservingReferences));
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

        byte[] bytes = JsonSerializationTestsLibrary.SerializeAndReadBytes(root, JsonSerializationTestsLibrary.OptionsPreservingReferences);

        Root2 deserializedRoot = JsonSerializer.Deserialize<Root2>(bytes, JsonSerializationTestsLibrary.OptionsPreservingReferences)!;
        Assert.That(deserializedRoot.Branches?[1].NestedLeaf?.Id, Is.EqualTo(1));
    }
}