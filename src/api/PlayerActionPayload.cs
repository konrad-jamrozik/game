using System.Text.Json.Serialization;
using UfoGameLib.Controller;

namespace UfoGameLib.Api;

/// <summary>
/// Represents a player action payload. The payload is expected to be deserialized
/// from a system boundary, e.g. from a JSON string received from a POST HTTP request.
///
/// The payload can be applied to a GameSessionController. See the Apply() method.
/// </summary>
[method: JsonConstructor]
public class PlayerActionPayload(string action, int[]? ids, int? targetId)
{
    // ReSharper disable MemberCanBePrivate.Global
    // Reason for ReSharper disable: these fields are used by the deserializer.
    public readonly string Action = action;
    public readonly int[]? Ids = ids;
    public readonly int? TargetId = targetId;
    // ReSharper restore MemberCanBePrivate.Global

    /// <summary>
    /// This method translates the PlayerActionPayload to appropriate player action
    /// on current GameState of the GameSessionController controller, and applies it.
    /// </summary>
    /// <returns>
    /// The output of this method is a mutation of the controller.GameSession.CurrentGameState,
    /// per the applied player action as captured by this payload.
    /// </returns>
    public void Apply(GameSessionController controller)
    {
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#property-pattern
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#positional-pattern

        Console.Out.WriteLine($"Called PlayerActionsPayload.Apply(). Action: {Action}");
        Action apply = TranslatePlayerActionToControllerAction(controller);
        apply();
    }

    private Action TranslatePlayerActionToControllerAction(GameSessionController controller)
        => Action switch
        {
            "AdvanceTime" => controller.AdvanceTime,
            "BuyTransportCap" => () => controller.TurnController.BuyTransportCapacity(1),
            "HireAgents" => () => controller.TurnController.HireAgents(1),
            "SackAgents" => () => controller.TurnController.SackAgents(Ids!),
            "SendAgentsToIncomeGeneration" => () => controller.TurnController.SendAgentsToGenerateIncome(Ids!),
            "SendAgentsToIntelGathering" => () => controller.TurnController.SendAgentsToGatherIntel(Ids!),
            "SendAgentsToTraining" => () => controller.TurnController.SendAgentsToTraining(Ids!),
            "RecallAgents" => () => controller.TurnController.RecallAgents(Ids!),
            "LaunchMission" => () => controller.TurnController.LaunchMission(TargetId!.Value, Ids!),
            _ => () => throw new InvalidOperationException($"Unsupported player action of '{Action}'")
        };
}