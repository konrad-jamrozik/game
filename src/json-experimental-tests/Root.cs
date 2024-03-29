using Lib.Json;

namespace JsonExperimental.Tests;

internal class Root : IRoot
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

internal class Branch
{
    [JsonRef]
    public readonly Leaf NestedLeaf;

    public int Id;

    public Branch(int id, Leaf nestedLeaf)
    {
        Id = id;
        NestedLeaf = nestedLeaf;
    }
}

internal class Leaf : IIdentifiable
{
    public string Value;

    public Leaf(int id, string value)
    {
        Id = id;
        Value = value;
    }

    public int Id { get; }
}
