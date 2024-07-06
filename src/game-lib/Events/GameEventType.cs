using System.Collections.Immutable;
using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Controller;

namespace UfoGameLib.Events;


[JsonConverter(typeof(StringJsonConverter<GameEventType>))]
public class GameEventType
{
    private readonly string _type;

    public const string MissionSiteExpiredEvent = "MissionSiteExpiredEvent";
    public const string ReportEvent = "ReportEvent";

    public static readonly ImmutableList<string> WorldEventTypes =
    [
        MissionSiteExpiredEvent,
        ReportEvent
    ];

    public static bool IsValidWorldEventType(string type) => WorldEventTypes.Contains(type);

    public static bool IsValidPlayerActionEvent(string type) => PlayerActionName.IsValid(type);

    public bool IsNotTimeAdvancement => ToString() != nameof(AdvanceTimePlayerAction);

    public GameEventType(string type)
    {
        Contract.Assert(IsValidWorldEventType(type) || IsValidPlayerActionEvent(type));
        _type = type;
    }

    public override string ToString()
    {
        return $"{_type}";
    }
}