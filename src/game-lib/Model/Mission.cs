namespace UfoGameLib.Model;

public class Mission
{
    // kja currently this gets duplicated upon serialization, because MissionSites get serialized directly too.
    // Use [JsonIgnore] from System.Text.Json but also ensure the references are handled properly
    public MissionSite Site;

    public Mission(MissionSite site)
    {
        // kja cannot use this assert here due to deserialization, but I should figure a way to use
        // it during normal model operation.
        // See also:
        // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/immutability?pivots=dotnet-7-0
        // Debug.Assert(site.IsActive);
        //
        // Here is the plan of attack:
        // Add [JsonIgnore] to Site
        // - use custom converter, like Lib.Primitives.DateDayJsonConverter, to ensure that:
        //   - during serialization, not the site, but site ID is serialized
        //   - during the deserialization, a ctor Mission(int siteId) is called that that hydrates the missionSite
        //     - this poses a problem: how to obtain reference to the actual missionSite?
        //     - maybe I will have to write custom converted that encompasses entire gme state, so GameStateJsonConverter<GameState>
        //       and use default converter most of the time: https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/converters-how-to?pivots=dotnet-7-0#use-default-system-converter
        // Super-fancy: auto-generate relevant json converters based on C# attribute, and also relevant serializer options.
        Site = site;
    }
}
