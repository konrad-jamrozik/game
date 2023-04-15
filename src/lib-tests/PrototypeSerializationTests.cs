using System.Collections.Generic;
using NUnit.Framework;

namespace Lib.Tests;

public class PrototypeSerializationTests
{
    [Test]
    public void RoundTripsSerializationWithReferences()
    {

    }
    
    class ExampleTopLevel
    {
        public List<ExampleLeaf> Leafs;
        public List<ExampleMid> Middles;

        public ExampleTopLevel(List<ExampleMid> middles, List<ExampleLeaf> leafs)
        {
            Middles = middles;
            Leafs = leafs;
        }
    }

    class ExampleMid
    {
        public ExampleLeaf NestedLeaf;

        public ExampleMid(ExampleLeaf nestedLeaf)
        {
            NestedLeaf = nestedLeaf;
        }
    }

    class ExampleLeaf
    {
        public int Id;
        public string Value;

        public ExampleLeaf(int id, string value)
        {
            Id = id;
            Value = value;
        }
    }
}