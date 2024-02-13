using System.Text.Json.Serialization;
using UfoGameLib.Controller;

namespace UfoGameLib.Api;

public class PlayerActionPayload
{
    public readonly string Action;
    public readonly int[]? Ids;
    public readonly int? TargetId;

    [JsonConstructor]
    public PlayerActionPayload(string action, int[]? ids, int? targetId)
    {
        Action = action;
        Ids = ids;
        TargetId = targetId;
    }

    public void Apply(GameSessionController controller)
    {
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#property-pattern
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#positional-pattern

        Console.Out.WriteLine($"Called PlayerActionsPayload.Apply(). Action: {Action}");
        // kja WIP
        Action apply = Action switch
        {
            "AdvanceTime" => controller.AdvanceTime,
            "BuyTransportCap" => () => controller.TurnController.BuyTransportCapacity(1),
            "HireAgents" => () => controller.TurnController.HireAgents(1),
            "SackAgents" => () => controller.TurnController.SackAgents(Ids!),
            "SendAgentsToIncomeGeneration" => () => controller.TurnController.SendAgentsToGenerateIncome(Ids!),
            "SendAgentsToIntelGathering" => () => controller.TurnController.SendAgentsToGatherIntel(Ids!),
            "SendAgentsToTraining" => () => controller.TurnController.SendAgentsToTraining(Ids!),
            "RecallAgents" => () => controller.TurnController.RecallAgents(Ids!),
            _ => () => { Console.Out.Write($"Unsupported action of {Action}"); }
        };

        apply();

        // int i = 1;
        // var agent = new Agent(id: i, turnHired: 1, Agent.AgentState.Available);
        // var missionSite = new MissionSite(id: i, difficulty: 1, turnAppeared: 1, expiresIn: 1);
        
        // controller.TurnController.LaunchMission(missionSite, [agent]);
    }
}