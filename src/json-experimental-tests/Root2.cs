using System.Collections.Generic;

namespace JsonExperimental.Tests;

internal class Root2 : IRoot
{
    public int Id;

    public Root2()
    {}

    public Root2(int id, List<Branch2>? branches, List<Leaf2>? leaves)
    {
        Id = id;
        Branches = branches;
        Leaves = leaves;
    }

    public required List<Branch2>? Branches { get; init; }
    public required List<Leaf2>? Leaves { get; init; }
}

internal class Branch2
{
    public required int Id;

    public Branch2()
    {
    }

    public Branch2(int id, Leaf2? nestedLeaf)
    {
        Id = id;
        NestedLeaf = nestedLeaf;
    }

    public required Leaf2? NestedLeaf { get; init; }
}

internal class Leaf2
{
    public required int Id;

    public Leaf2()
    {
    }

    public Leaf2(int id, string? value)
    {
        Id = id;
        Value = value;
    }

    public required string? Value { get; init; }
}