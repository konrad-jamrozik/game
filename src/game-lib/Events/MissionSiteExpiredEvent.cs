namespace UfoGameLib.Events;

public class MissionSiteExpiredEvent : WorldEvent
{
    public readonly int SiteId;

    public MissionSiteExpiredEvent(int id, int siteId) : base(id, nameof(MissionSiteExpiredEvent))
    {
        SiteId = siteId;
    }

    public override MissionSiteExpiredEvent Clone()
        => new(Id, SiteId);
}