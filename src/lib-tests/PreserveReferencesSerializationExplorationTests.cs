using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
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
        var root = new Root(branches, leaves);

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
        var root = new Root(branches, leaves);

        byte[] bytes = SerializeAndReadBytes(root, OptionsPreservingReferences);

        Root2 deserializedRoot = JsonSerializer.Deserialize<Root2>(bytes, OptionsPreservingReferences)!;
        Assert.That(deserializedRoot.Branches?[1].NestedLeaf?.Id, Is.EqualTo(1));
    }

    // kja curr TDD test WorkInProgressDeserializesPreservedReferencesUsingCtorAndCustomConverter
    [Test]
    public void WorkInProgressDeserializesPreservedReferencesUsingCtorAndCustomConverter()
    {
        var leaves = new List<Leaf> { new Leaf(0, "abc"), new Leaf(1, "xyz") };
        var branches = new List<Branch> { new Branch(0, leaves[0]), new Branch(1, leaves[1]) };
        var root = new Root(branches, leaves);

        var options = new JsonSerializerOptions
        {
            Converters = { new RootJsonConverter(serializationOptions: Options) }
        };

        byte[] bytes = SerializeAndReadBytes(root, options);

        try
        {
            Root deserializedRoot = JsonSerializer.Deserialize<Root>(bytes, options)!;
            Assert.That(deserializedRoot.Branches[1].NestedLeaf.Id, Is.EqualTo(1));
        }
        catch (Exception _)
        {
            Console.WriteLine("Currently fails for reasons explained in https://github.com/dotnet/docs/issues/35020");
        }
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

        private static readonly JsonConverter<Root> RootDefaultConverter = 
            (JsonConverter<Root>)JsonSerializerOptions.Default.GetConverter(typeof(Root));

        private static readonly JsonConverter<Branch> BranchDefaultConverter = 
            (JsonConverter<Branch>)JsonSerializerOptions.Default.GetConverter(typeof(Branch));

        public RootJsonConverter(JsonSerializerOptions serializationOptions)
        {
            _serializationOptions = serializationOptions;
        }

        // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/use-dom-utf8jsonreader-utf8jsonwriter?pivots=dotnet-7-0#use-utf8jsonreader
        // #35019 Code snippet in 'Consume decoded JSON strings' in 'How to use a JSON document, Utf8JsonReader, and Utf8JsonWriter in System.Text.Json' does not compile 
        // https://github.com/dotnet/docs/issues/35019
        public override Root? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Console.Out.WriteLine($"typeToConvert: {typeToConvert.FullName}");
            // ReadToWriteDiagToConsole(reader);

            // var data = ExperimentalRead(reader);
            // Console.Out.WriteLine("Read: " + data);
            // return JsonSerializer.Deserialize<Root>(data, _serializationOptions);

            // Currently incomplete implementation, for reasons explained in:
            // https://github.com/dotnet/docs/issues/35020
            return null;
        }

        public override void Write(Utf8JsonWriter writer, Root value, JsonSerializerOptions options)
        {
            writer.WriteRawValue(JsonSerializer.Serialize(value, _serializationOptions));
        }

        private static void ReadToWriteDiagToConsole(Utf8JsonReader reader)
        {
            while (reader.Read())
            {
                Console.Out.WriteLine("");
                Console.Out.WriteLine($"TokenType: {reader.TokenType}");

                switch (reader.TokenType)
                {
                    case JsonTokenType.PropertyName:
                    case JsonTokenType.String:
                    {
                        string? text = reader.GetString();
                        Console.Write(" ");
                        Console.Write(text);
                        break;
                    }

                    case JsonTokenType.Number:
                    {
                        int intValue = reader.GetInt32();
                        Console.Write(" ");
                        Console.Write(intValue);
                        break;
                    }
                }
            }
        }

        // Use it like this in the caller:
        //   var data = ExperimentalRead(reader);
        //   Console.Out.WriteLine("Read: " + data);
        //   return JsonSerializer.Deserialize<Root>(data, _serializationOptions);
        private string ExperimentalRead(Utf8JsonReader reader)
        {
            var sb = new StringBuilder();

            JsonTokenType? prevTokenType = null;

            while (reader.Read())
            {
                JsonTokenType tokenType = reader.TokenType;

                if (prevTokenType == JsonTokenType.PropertyName)
                    sb.Append(": ");

                switch (tokenType)
                {
                    case JsonTokenType.StartObject:

                        sb.Append('{');
                        break;
                    case JsonTokenType.EndObject:
                        sb.Append('}');
                        break;
                    case JsonTokenType.StartArray:
                        sb.Append('[');
                        break;
                    case JsonTokenType.EndArray:
                        sb.Append(']');
                        break;
                    case JsonTokenType.PropertyName:
                        sb.Append('"');
                        sb.Append(reader.GetString());
                        sb.Append('"');
                        break;
                    case JsonTokenType.String:
                        sb.Append('"');
                        sb.Append(reader.GetString());
                        sb.Append('"');
                        break;
                    case JsonTokenType.Number:
                        sb.Append(reader.GetInt16());
                        break;
                    case JsonTokenType.True:
                        sb.Append("\"true\"");
                        break;
                    case JsonTokenType.False:
                        sb.Append("\"false\"");
                        break;
                    case JsonTokenType.Null:
                        sb.Append(reader.ValueSpan.ToArray());
                        break;
                }

                if (tokenType != JsonTokenType.None)
                {
                    sb.Append(' ');
                }

                prevTokenType = tokenType;
            }

            string jsonString = sb.ToString();
            return jsonString;
        }
    }

    private interface IRoot
    {

    }

    private class Root : IRoot
    {
        public List<Branch> Branches;
        public List<Leaf> Leaves;

        public Root(List<Branch> branches, List<Leaf> leaves)
        {
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
        public required List<Branch2>? Branches { get; init; }
        public required List<Leaf2>? Leaves { get; init; }

        public Root2()
        {}

        public Root2(List<Branch2>? branches, List<Leaf2>? leaves)
        {
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