# JSON serialization (`System.Text.Json`)

This document codifies hard-earned knowledge about JSON serialization, especially [`System.Text.Json`].

## Serialization fails due to issues with binding ctor parameters

If you encounter this example error when calling `JsonNode.Deserialize<T>`
([`System.Text.Json.JsonSerializer.Deserialize[TValue]`][`Deserialize<TValue>(JsonNode, JsonSerializerOptions)`], [src]):

> System.InvalidOperationException : Each parameter in the deserialization constructor on type
> 'UfoGameLib.Model.MissionSiteModifiers' must bind to an object property or field on deserialization.
> Each parameter name must match with a property or field on the object.
> Fields are only considered when 'JsonSerializerOptions.IncludeFields' is enabled. The match can be case-insensitive.

Then one of the possible non-obvious root-causes is that there exists a non-nullable field on the object but it is nullable
in the primary ctor marked with `[JsonConstructor]`.

If the field cannot be made nullable then recommended way to fix it is to make it non-nullable in primary ctor
and introduce a secondary ctor (or a factory method) that makes it nullable.

## JsonConstructor should have at least one non-nullable param

Aat least one param in ctor marked as `System.Text.Json.Serialization.JsonConstructorAttribute` must be mandatory;
otherwise JSON deserialization would implicitly call ctor with no args, circumventing any validation done in the PR ctor.

Example case where I encountered this:

The frontend was receiving malformed `GameSessionTurn`, circumventing a call to `AssertInvariants()` from the ctor,
because in `ApiUtils.ParseGameSessionTurn` this call used the default no-arg ctor:

```csharp
parsedTurn = (requestBody.FromJsonTo<GameSessionTurn>(GameState.StateJsonSerializerOptions));
```

[`System.Text.Json`]: https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview
[`Deserialize<TValue>(JsonNode, JsonSerializerOptions)`]: https://learn.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializer.deserialize?view=net-8.0#system-text-json-jsonserializer-deserialize-1(system-text-json-nodes-jsonnode-system-text-json-jsonserializeroptions)
[src]: https://github.com/dotnet/runtime/blob/5535e31a712343a63f5d7d796cd874e563e5ac14/src/libraries/System.Text.Json/src/System/Text/Json/Serialization/JsonSerializer.Read.Node.cs#L30
