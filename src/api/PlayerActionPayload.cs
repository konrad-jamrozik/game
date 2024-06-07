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
[method: JsonConstructor]
public class PlayerActionPayload(string actionName, int[]? ids, int? targetId)
{
    // ReSharper disable MemberCanBePrivate.Global
    // Reason for 'ReSharper disable MemberCanBePrivate.Global': these fields are used by the deserializer.
    public readonly string ActionName = actionName;
    public readonly int[]? Ids = ids;
    public readonly int? TargetId = targetId;

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
        => ActionName switch
        {
            // kja these should be nameof(derived PlayerAction). In frontend they will be consumed by getDisplayedType()
            "AdvanceTime" => () => controller.AdvanceTime(),
            "BuyTransportCap" => () => controller.CurrentTurnController.BuyTransportCapacity(1),
            "HireAgents" => () => controller.CurrentTurnController.HireAgents(TargetId!.Value),
            "SackAgents" => () => controller.CurrentTurnController.SackAgents(Ids!),
            "SendAgentsToIncomeGeneration" => () => controller.CurrentTurnController.SendAgentsToGenerateIncome(Ids!),
            "SendAgentsToIntelGathering" => () => controller.CurrentTurnController.SendAgentsToGatherIntel(Ids!),
            "SendAgentsToTraining" => () => controller.CurrentTurnController.SendAgentsToTraining(Ids!),
            "RecallAgents" => () => controller.CurrentTurnController.RecallAgents(Ids!),
            "LaunchMission" => () => controller.CurrentTurnController.LaunchMission(TargetId!.Value, Ids!),
            _ => () => throw new ArgumentException($"Unsupported player action of '{ActionName}'")
        };
}
