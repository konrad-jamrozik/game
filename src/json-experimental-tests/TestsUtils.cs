using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

internal static class TestsUtils
{
    private const string SerializedJsonFilePath = "./temp_test_data.json";

    internal static readonly JsonSerializerOptions Options = new JsonSerializerOptions
    {
        IncludeFields = true,
        WriteIndented = true,
    };

    internal static readonly JsonSerializerOptions OptionsPreservingReferences = new JsonSerializerOptions(Options)
    {
        ReferenceHandler = ReferenceHandler.Preserve
    };

    internal static byte[] SerializeAndReadBytes<T>(T root, JsonSerializerOptions options) where T : IRoot
    {
        string json = JsonSerializer.Serialize(root, options);
        File.WriteAllText(TestsUtils.SerializedJsonFilePath, json);
        Console.Out.WriteLine($"Saved to: {Path.GetFullPath(TestsUtils.SerializedJsonFilePath)}");
        var bytes = File.ReadAllBytes(TestsUtils.SerializedJsonFilePath);
        return bytes;
    }
}