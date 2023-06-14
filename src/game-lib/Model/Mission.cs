namespace UfoGameLib.Model;

public class Mission
{
    // kja currently this gets duplicated upon serialization, because MissionSites get serialized directly too.
    // Use [JsonIgnore] from System.Text.Json but also ensure the references are handled properly
    public MissionSite Site;

    public Mission(MissionSite site)
    {
        /* kja cannot use this assert here due to deserialization, but I should figure a way to use
           it during normal program execution.
           To be exact: as long as the game executes, this assertion will hold, i.e. upon Mission construction,
           the site passed as argument will be active.
           But later on it will be set to false, and then it will get saved.
           Deserializing the Mission will use the same ctor with site as input, thus violating the assertion.
           Deserialization would have to use different ctor, or this ctor should somehow know it is called from deserialization.
           
           See also:
           https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/immutability?pivots=dotnet-7-0
        */
        // Debug.Assert(site.IsActive);
        /*
           Here is the plan of attack:
           - Add [JsonIgnore] to Site
           - use custom converter, like Lib.Primitives.DateDayJsonConverter, to ensure that:
             - during serialization, not the site, but site ID is serialized
             - during the deserialization, a ctor Mission(int siteId) is called that hydrates the missionSite
               - this poses a problem: how to obtain reference to the actual missionSite?
               - maybe I will have to write custom converter that encompasses entire game state, so GameStateJsonConverter<GameState>
                 and use default converter most of the time:
                 https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/converters-how-to?pivots=dotnet-7-0#use-default-system-converter
                 https://github.com/dotnet/docs/issues/35020
           Super-fancy: auto-generate relevant json converters based on C# attribute, and also relevant serializer options.

           Note I have some proof-of-concept of the plan above in:
             Lib.Tests.ReferencePreservingSerializationExplorationTests.RootJsonConverter
        */
        Site = site;
    }
}
