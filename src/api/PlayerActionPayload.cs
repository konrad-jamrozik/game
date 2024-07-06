// codesync: UfoGameLib.Api.PlayerActionPayload

using System.Text.Json.Serialization;
using UfoGameLib.Controller;
using UfoGameLib.Events;

namespace UfoGameLib.Api;

/// <summary>
/// Represents a player action payload. The payload is expected to be deserialized
/// from a system boundary, e.g. from a JSON string received from a POST HTTP request.
///
/// The payload can be applied to a GameSessionController. See the Apply() method.
/// </summary>

// ReSharper disable once ClassNeverInstantiated.Global
// Reason: used by JSON deserializer.
public class PlayerActionPayload
{
    public readonly PlayerActionName Name;
    // ReSharper disable MemberCanBePrivate.Global
    // Reason: used by JSON deserializer.
    public readonly int[]? Ids;
    public readonly int? TargetId;

    public PlayerActionPayload(string name, int[]? ids, int? targetId) : this(new PlayerActionName(name), ids, targetId)
    {
    }

    /// <summary>
    /// Represents a player action payload. The payload is expected to be deserialized
    /// from a system boundary, e.g. from a JSON string received from a POST HTTP request.
    ///
    /// The payload can be applied to a GameSessionController. See the Apply() method.
    /// </summary>
    [JsonConstructor]
    public PlayerActionPayload(PlayerActionName name, int[]? ids, int? targetId)
    {
        Name = name;
        Ids = ids;
        TargetId = targetId;
    }

    /// <summary>
    /// This method translates the PlayerActionPayload to appropriate player action
    /// on current GameState of the GameSessionController controller, and applies it.
    /// </summary>
    /// <returns>
    /// The output of this method is a mutation of the controller.GameSession.CurrentGameState,
    /// per the applied player action as captured by this payload.
    /// </returns>
    public PlayerActionEvent Apply(GameSessionController controller)
    {
        Func<PlayerActionEvent> apply = TranslatePlayerActionToControllerAction(controller);
        return apply();
    }

    private Func<PlayerActionEvent> TranslatePlayerActionToControllerAction(GameSessionController controller)
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#property-pattern
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#positional-pattern
        => Name.ToString() switch
        {
            GameEventType.AdvanceTimePlayerAction => () => controller.AdvanceTime().advaceTimeEvent,
            nameof(BuyTransportCapacityPlayerAction) => () => controller.CurrentTurnController.BuyTransportCapacity(TargetId!.Value),
            nameof(InvestIntelPlayerAction) => () => controller.CurrentTurnController.InvestIntel(Ids![0], TargetId!.Value),
            nameof(HireAgentsPlayerAction) => () => controller.CurrentTurnController.HireAgents(TargetId!.Value),
            nameof(SackAgentsPlayerAction) => () => controller.CurrentTurnController.SackAgents(Ids!),
            nameof(SendAgentsToGenerateIncomePlayerAction) => () => controller.CurrentTurnController.SendAgentsToGenerateIncome(Ids!),
            nameof(SendAgentsToGatherIntelPlayerAction) => () => controller.CurrentTurnController.SendAgentsToGatherIntel(Ids!),
            nameof(SendAgentsToTrainingPlayerAction) => () => controller.CurrentTurnController.SendAgentsToTraining(Ids!),
            nameof(RecallAgentsPlayerAction) => () => controller.CurrentTurnController.RecallAgents(Ids!),
            nameof(LaunchMissionPlayerAction) => () => controller.CurrentTurnController.LaunchMission(TargetId!.Value, Ids!),
            _ => () => throw new ArgumentException($"Unsupported player action of '{Name}'")
        };
}
