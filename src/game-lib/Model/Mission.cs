namespace UfoGameLib.Model;

public class Mission
{
    public MissionSite Site;

    public Mission(MissionSite site, bool? skipValidation = false)
    {
        Debug.Assert(site.IsActive || (skipValidation ?? false));

        Site = site;
        Site.IsActive = false;
    }
}
