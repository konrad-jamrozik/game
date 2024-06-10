// ReSharper disable MemberCanBePrivate.Global
// Reason: public fields are being serialized to JSON.
namespace UfoGameLib.Events;

public class MissionSiteExpiredEvent : WorldEvent
{
    public readonly int TargetId;

    public MissionSiteExpiredEvent(int id, int targetId) : base(id, nameof(MissionSiteExpiredEvent))
    {
        TargetId = targetId;
    }

    public override MissionSiteExpiredEvent Clone()
        => new(Id, TargetId);
}