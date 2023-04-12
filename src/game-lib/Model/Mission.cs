namespace UfoGameLib.Model;

public class Mission
{
    // kja currently this gets duplicated upon serialization, because MissionSites get serialized directly too.
    // Use [JsonIgnore] from System.Text.Json but also ensure the references are handled properly
    public MissionSite Site;

    public Mission(MissionSite site)
    {
        Site = site;
    }
}
