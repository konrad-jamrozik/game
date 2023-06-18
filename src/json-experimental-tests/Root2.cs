using System.Collections.Generic;

namespace JsonExperimental.Tests;

internal class Root2 : IRoot
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

internal class Branch2
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

internal class Leaf2
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