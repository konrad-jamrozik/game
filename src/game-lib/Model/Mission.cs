using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public MissionSite Site;

    public Mission(int id, MissionSite site, bool? skipValidation = false)
    {
        Debug.Assert(site.IsActive || (skipValidation ?? false));

        Id = id;
        Site = site;
        Site.IsActive = false;
    }

    public int Id { get; }
}
