using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;

namespace Lib.Tests;

public class SerializationExplorationTests
{
    [SetUp]
    public void Setup()
    {
    }

    // Based on https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/preserve-references?pivots=dotnet-7-0
    [Test]
    public void SerializationTest()
    {
        Employee tyler = new()
        {
            Name = "Tyler Stein"
        };

        Employee adrian = new()
        {
            Name = "Adrian King"
        };

        tyler.DirectReports = new List<Employee> { adrian };
        adrian.Manager = tyler;

        JsonSerializerOptions options = new()
        {
            ReferenceHandler = ReferenceHandler.Preserve,
            WriteIndented = true
        };

        string tylerJson = JsonSerializer.Serialize(tyler, options);
        Console.WriteLine($"Tyler serialized:\n{tylerJson}");

        Employee? tylerDeserialized =
            JsonSerializer.Deserialize<Employee>(tylerJson, options);

        Console.WriteLine(
            "Tyler is manager of Tyler's first direct report: ");
        Console.WriteLine(
            tylerDeserialized?.DirectReports?[0].Manager == tylerDeserialized);
    }

    private class Employee
    {
        public string? Name { get; set; }
        public Employee? Manager { get; set; }
        public List<Employee>? DirectReports { get; set; }
    }
}