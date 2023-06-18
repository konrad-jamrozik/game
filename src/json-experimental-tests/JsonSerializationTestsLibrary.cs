using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

internal static class JsonSerializationTestsLibrary
{
    internal static readonly JsonSerializerOptions Options = new JsonSerializerOptions
    {
        IncludeFields = true,
        WriteIndented = true,
    };

    internal static readonly JsonSerializerOptions OptionsPreservingReferences = new JsonSerializerOptions(Options)
    {
        ReferenceHandler = ReferenceHandler.Preserve
    };

    internal const string SerializedJsonFilePath = "./temp_test_data.json";

    internal static byte[] SerializeAndReadBytes<T>(T root, JsonSerializerOptions options) where T : IRoot
    {
        string json = JsonSerializer.Serialize(root, options);
        File.WriteAllText(JsonSerializationTestsLibrary.SerializedJsonFilePath, json);
        Console.Out.WriteLine($"Saved to: {Path.GetFullPath(JsonSerializationTestsLibrary.SerializedJsonFilePath)}");
        var bytes = File.ReadAllBytes(JsonSerializationTestsLibrary.SerializedJsonFilePath);
        return bytes;
    }
}