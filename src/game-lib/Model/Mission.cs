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
        Site = site;
    }
}
