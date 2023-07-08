using System;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Lib.Primitives;
using Newtonsoft.Json.Linq;

namespace Lib.Json;

// kja2 need to add set of json tests showing all conversions, like:
// type T -> json string
// json string -> type T
// + the choices from https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/use-dom-utf8jsonreader-utf8jsonwriter?pivots=dotnet-7-0
// + file system e.g. Lib.OS.FileSystem.ReadAllJson
// See also: https://github.com/dotnet/docs/issues/24251#issue-892559426
public static class JsonExtensions
{
    private const int MaxDepth = 64;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        MaxDepth = MaxDepth,
        ReadCommentHandling = JsonCommentHandling.Skip,
        Converters = { new DateDayJsonConverter() },
        IncludeFields = true,
        // I am not using "ReferenceHandler.Preserve" due to reasons explained here:
        // https://github.com/dotnet/docs/issues/35020#issue-1669574543
        // Instead, see "JsonConverterSupportingReferences" class.
        // ReferenceHandler = ReferenceHandler.Preserve
    };

    private static readonly JsonSerializerOptions SerializerOptionsUnsafe = new(SerializerOptions)
    {
        // Necessary to avoid escaping "+" and other characters.
        // Reference:
        // Explanation of how to avoid escaping:
        // https://stackoverflow.com/questions/58003293/dotnet-core-system-text-json-unescape-unicode-string
        // Issue reporting this, with links to discussions explaining the default escaping behavior:
        // https://github.com/dotnet/runtime/issues/29879
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    private static readonly JsonSerializerOptions SerializerOptionsUnsafeIgnoreNulls = new(SerializerOptionsUnsafe)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public static readonly JsonSerializerOptions SerializerOptionsIndentedUnsafe =
        new(SerializerOptionsUnsafe) { WriteIndented = true };

    public static T FromJsonTo<T>(this string json) =>
        JsonSerializer.Deserialize<T>(json, SerializerOptions)!;

    public static T FromJsonTo<T>(this byte[] bytes, JsonSerializerOptions? options = null) =>
        JsonSerializer.Deserialize<T>(bytes, options ?? SerializerOptions)!;

    public static T FromJsonToUnsafe<T>(this string json) =>
        JsonSerializer.Deserialize<T>(json, SerializerOptionsUnsafe)!;

    /// <remarks>
    /// Related issue
    /// https://github.com/dotnet/docs/issues/24251
    /// </remarks>
    public static JsonElement FromObjectToJsonElement(this object obj) =>
        FromJsonTo<JsonElement>(JsonSerializer.SerializeToUtf8Bytes(obj));

    public static string ToUnsafeJsonString(this object data, bool ignoreNulls = false) => 
        JsonSerializer.Serialize(data, ignoreNulls ? SerializerOptionsUnsafeIgnoreNulls : SerializerOptionsUnsafe);

    public static string ToIndentedUnsafeJsonString(this object data, JsonSerializerOptions? options = null) =>
        JsonSerializer.Serialize(data, options ?? SerializerOptionsIndentedUnsafe);

    /// <remarks>
    /// Based on https://stackoverflow.com/a/58193164/986533
    /// Issue for native support of converting DOM (JsonElement) to a typed object:
    /// https://github.com/dotnet/runtime/issues/31274
    /// </remarks>
    public static T? ToObject<T>(this JsonElement element)
    {
        string json = element.GetRawText();
        // kj2-json make JSON without comments into reusable OO logic.
        string jsonWithoutComments = string.Join(Environment.NewLine,
            json.Split(Environment.NewLine).Where(line => !line.TrimStart().StartsWith("//")));
        return JsonSerializer.Deserialize<T>(jsonWithoutComments);
    }

    public static T? ToObject<T>(this JsonDocument document) => ToObject<T>(document.RootElement);

    /// <remarks>
    /// Using Newtonsoft.Json's JObject to do the merging as System.Text.Json doesn't support it as of
    /// 7/15/2021.
    /// Issue for native support of JSON merging:
    /// https://github.com/dotnet/docs/issues/24252
    /// and relevant SOQ linked from it:
    /// https://stackoverflow.com/questions/58694837/system-text-json-merge-two-objects
    ///
    /// Note there is a way of doing it without Newtonsoft, but way too cumbersome.
    /// It would go like that:
    /// Input: strings of jsons to merge
    /// 
    /// 1. Deserialize the inputs strings to JsonElements
    /// e.g. jsonStr.FromJsonToUnsafe{JsonElement}()
    /// 
    /// 2. Create dynamic ExpandoObject()
    /// e.g. dynamic expandoObj = new ExpandoObject();
    /// 
    /// 3. Build it up from the JsonElements. This is where the merging is done.
    /// 
    /// 4. Deserialize the ExpandoObject to JsonElement.
    /// e.g. JsonSerializer.Deserialize{JsonElement}(JsonSerializer.SerializeToUtf8Bytes(expandoObj));
    ///
    /// 5. Serialize it to string
    /// e.g. jsonElem.ToIndentedUnsafeJsonString()
    /// </remarks>
    public static JsonElement Append(this JsonElement target, string propertyName, JsonElement appended)
    {
        string targetJson = target.ToUnsafeJsonString();
        string appendedJson = appended.ToUnsafeJsonString();
        var targetObject = JObject.Parse(targetJson);
        var appendedObject = JObject.Parse(appendedJson);
        appendedObject = new JObject(new JProperty(propertyName, appendedObject));
        targetObject.Merge(appendedObject, new JsonMergeSettings
        {
            MergeArrayHandling = MergeArrayHandling.Merge,
            MergeNullValueHandling = MergeNullValueHandling.Merge,
            PropertyNameComparison = StringComparison.InvariantCultureIgnoreCase
        });
        var mergedTarget = FromJsonToUnsafe<JsonElement>(targetObject.ToString());
        return mergedTarget;
    }
}