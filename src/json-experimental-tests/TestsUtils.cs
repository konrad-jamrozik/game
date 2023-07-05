using System;
using System.IO;
using System.Text.Json;

namespace JsonExperimental.Tests;

internal static class TestsUtils
{
    private const string SerializedJsonFilePath = "./temp_test_data.json";

    internal static byte[] SerializeAndReadBytes<T>(T root, JsonSerializerOptions options) where T : IRoot
    {
        string json = JsonSerializer.Serialize(root, options);
        File.WriteAllText(SerializedJsonFilePath, json);
        Console.Out.WriteLine($"Saved to: {Path.GetFullPath(SerializedJsonFilePath)}");
        var bytes = File.ReadAllBytes(SerializedJsonFilePath);
        return bytes;
    }
}