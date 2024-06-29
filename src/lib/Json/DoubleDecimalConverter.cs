using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lib.Json;

public class DoubleDecimalConverter : JsonConverter<double>
{
    private readonly int _decimalPlaces;

    public DoubleDecimalConverter(int decimalPlaces)
    {
        if (decimalPlaces < 0)
        {
            throw new ArgumentException($"Decimal places ({decimalPlaces}) must be non-negative.");
        }
        _decimalPlaces = decimalPlaces;
    }

    public override double Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDouble();
    }

    public override void Write(Utf8JsonWriter writer, double value, JsonSerializerOptions options)
    {
        // Limit the number of decimal places
        double roundedValue = Math.Round(value, _decimalPlaces);
        writer.WriteNumberValue(roundedValue);
    }
}