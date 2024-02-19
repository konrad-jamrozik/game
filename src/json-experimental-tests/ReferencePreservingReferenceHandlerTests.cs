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

        byte[] bytes = TestsUtils.SerializeAndReadBytes(root, JsonSerializerOptionsLibrary.OptionsPreservingReferences);

        Assert.Throws<NotSupportedException>(() => JsonSerializer.Deserialize<Root>(bytes, JsonSerializerOptionsLibrary.OptionsPreservingReferences));
    }

    [Test]
    public void DeserializesPreservingReferencesUsingInitProps()
    {
        // Note that in this test we serialize Root/Branch/Leaf
        // and deserialize Root2/Branch2/Leaf2
        // Serializing Root2/Branch2/Leaf2 instead of Root/Branch/Leaf also works.
        //
        // We deserialize Root2/Branch2/Leaf2 as only this will work with ReferenceHandler.Preserve
        // because Root2 etc. has 'init' props. The need for that is explained here:
        // https://github.com/dotnet/runtime/issues/73302#issuecomment-1204104384
        // and broader context can be found here:
        // https://github.com/dotnet/docs/issues/35020
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(7, branches, leaves);

        byte[] bytes = TestsUtils.SerializeAndReadBytes(root, JsonSerializerOptionsLibrary.OptionsPreservingReferences);

        Root2 deserializedRoot = JsonSerializer.Deserialize<Root2>(bytes, JsonSerializerOptionsLibrary.OptionsPreservingReferences)!;
        Assert.That(deserializedRoot.Branches?[1].NestedLeaf?.Id, Is.EqualTo(1));
    }
}