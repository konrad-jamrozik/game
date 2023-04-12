namespace UfoGameLib.Model;

public class Mission
{
    // kja currently this gets duplicated upon serialization, because MissionSites get serialized directly too.
    public MissionSite Site;

    public Mission(MissionSite site)
    {
        Debug.Assert(site.IsActive);
        Site = site;
    }
}
