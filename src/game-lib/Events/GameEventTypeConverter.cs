using System.Text.Json;
using System.Text.Json.Serialization;

namespace UfoGameLib.Events;

public class GameEventTypeConverter : JsonConverter<GameEventType>
{
    public override GameEventType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        Console.WriteLine("KJA GameEventTypeConverter.Read");
        return new GameEventType(reader.GetString()!);
    }

    public override void Write(Utf8JsonWriter writer, GameEventType value, JsonSerializerOptions options)
    {
        Console.WriteLine("KJA GameEventTypeConverter.Write");
        writer.WriteStringValue(value.ToString());
    }
}