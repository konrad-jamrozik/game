using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lib.Json;

public class StringJsonConverter<T> : JsonConverter<T> where T : class
{
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        ConstructorInfo? constructor = typeof(T).GetConstructor([typeof(string)]);

        string stringValue = reader.GetString()!;
        if (constructor == null)
        {
            throw new InvalidOperationException(
                $"Type {typeof(T)} does not have a constructor that takes a single string argument.");
        }

        return (T)constructor.Invoke([stringValue]);
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}