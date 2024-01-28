using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

public class JsonIncludeReproTests
{
    /// <summary>
    /// This test shows that [JsonInclude] does not override
    /// JsonSerializedOptions.IgnoreReadOnlyProperties = true,
    /// because the included property QuxProp is not included.
    /// 
    /// This contrasts with the behavior of [JsonIgnore]:
    /// This test shows that [JsonIgnore] overrides
    /// JsonSerializedOptions.IgnoreReadOnlyProperties = false
    /// by ensuring the ignored property BarProp is not serialized.
    ///
    /// For reported issue, see:
    /// https://github.com/dotnet/runtime/issues/88716
    /// For gist, see:
    /// https://gist.github.com/konrad-jamrozik/721a9c7624560fae0d1582353ef0708e
    /// </summary>
    [Test]
    public void JsonIgnoreOverridesOptionsButJsonIncludeDoesNot()
    {
        string serializedFoo1 = JsonSerializer.Serialize(
            new FooClass(),
            new JsonSerializerOptions
            {
                IgnoreReadOnlyProperties = false
            });

        // Read-only property that got [JsonIgnored], so it shouldn't be present,
        Assert.That(!serializedFoo1.Contains("BarProp"));
        
        // Read-only property, so it should be present.
        Assert.That(serializedFoo1.Contains("QuxProp"));

        string serializedFoo2 = JsonSerializer.Serialize(
            new FooClass(),
            new JsonSerializerOptions
            {
                IgnoreReadOnlyProperties = true
            });

        // Read-only property that got [JsonIgnored] AND is ignored.
        Assert.That(!serializedFoo2.Contains("BarProp"));

        // Read-only property that got [JsonInclude], so it should be present.
        // !!! THIS IS THE REPRO / TEST FAILURE !!!
        Assert.That(serializedFoo2.Contains("QuxProp"));
    }

    private class FooClass
    {
        public FooClass()
        {
            BarProp = 10;
            QuxProp = 20;
        }

        [JsonIgnore]
        public int BarProp { get; }

        [JsonInclude]
        public int QuxProp { get; }
    }
}