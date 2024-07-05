using System.Collections.Immutable;
using Lib.Contracts;
using UfoGameLib.Controller;

namespace UfoGameLib.Events;

// kja make abstract?
public class GameEventType
{
    private readonly string _type;

    // kja AdvanceTimePlayerAction should inherit from PlayerAction
    public const string AdvanceTimePlayerAction = "AdvanceTimePlayerAction";
    public const string MissionSiteExpiredEvent = "MissionSiteExpiredEvent";
    public const string ReportEvent = "ReportEvent";

    public static readonly ImmutableList<string> GameEventTypes =
    [
        AdvanceTimePlayerAction,
        MissionSiteExpiredEvent,
        ReportEvent
    ];

    // kja use GameEventType
    public GameEventType(string type)
    {
        Contract.Assert(GameEventTypes.Contains(type) || PlayerAction.IsValidName(type));
        _type = type;
    }
}
