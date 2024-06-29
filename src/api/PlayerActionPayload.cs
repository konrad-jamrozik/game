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
    // kja2-assert: instead of string this should be an enum or something. See https://chatgpt.com/c/fb0a4197-4397-4f3f-bc13-2e0468141b0b
    // put this constraint in JsonCtor (currently primary ctor, so: weird)
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
            GameEventName.AdvanceTimePlayerAction => () => controller.AdvanceTime().advaceTimeEvent,
            nameof(BuyTransportCapacityPlayerAction) => () => controller.CurrentTurnController.BuyTransportCapacity(TargetId!.Value),
            nameof(InvestIntelPlayerAction) => () => controller.CurrentTurnController.InvestIntel(Ids![0], TargetId!.Value),
            nameof(HireAgentsPlayerAction) => () => controller.CurrentTurnController.HireAgents(TargetId!.Value),
            nameof(SackAgentsPlayerAction) => () => controller.CurrentTurnController.SackAgents(Ids!),
            nameof(SendAgentsToGenerateIncomePlayerAction) => () => controller.CurrentTurnController.SendAgentsToGenerateIncome(Ids!),
            nameof(SendAgentsToGatherIntelPlayerAction) => () => controller.CurrentTurnController.SendAgentsToGatherIntel(Ids!),
            nameof(SendAgentsToTrainingPlayerAction) => () => controller.CurrentTurnController.SendAgentsToTraining(Ids!),
            nameof(RecallAgentsPlayerAction) => () => controller.CurrentTurnController.RecallAgents(Ids!),
            nameof(LaunchMissionPlayerAction) => () => controller.CurrentTurnController.LaunchMission(TargetId!.Value, Ids!),
            _ => () => throw new ArgumentException($"Unsupported player action of '{ActionName}'")
        };
}
