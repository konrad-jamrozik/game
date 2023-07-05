using System.Text.Json;
using System.Text.Json.Serialization;

namespace JsonExperimental.Tests;

internal static class JsonSerializerOptionsLibrary
{
    internal static readonly JsonSerializerOptions BaseOptions = new JsonSerializerOptions
    {
        IncludeFields = true,
        WriteIndented = true,
    };

    internal static readonly JsonSerializerOptions OptionsPreservingReferences = new JsonSerializerOptions(BaseOptions)
    {
        ReferenceHandler = ReferenceHandler.Preserve
    };
}