using System.Text.Json.Serialization;
using UfoGameLib.Controller;

namespace UfoGameLib.Api;

public class PlayerActionPayload
{
    public readonly string Action;
    public readonly int[]? Ids;

    [JsonConstructor]
    public PlayerActionPayload(string action, int[]? ids)
    {
        Action = action;
        Ids = ids;
    }

    public void Apply(GameSessionController controller)
    {
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#property-pattern
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns#positional-pattern

        Console.Out.WriteLine($"Called PlayerActionsPayload.Apply(). Action: {Action}");
        // kja WIP
        Action apply = Action switch
        {
            "HireAgents" => () => controller.TurnController.HireAgents(1),
            "AssignToIncomeGeneration" => () => controller.TurnController.SendAgentsToGenerateIncome(Ids!),
            "BuyTransportCap" => () => controller.TurnController.BuyTransportCapacity(1),
            "SackAgents" => () => controller.TurnController.SackAgents(Ids!),
            _ => () => { Console.Out.Write($"Unsupported action of {Action}"); }
        };

        apply();

        // int i = 1;
        // var agent = new Agent(id: i, turnHired: 1, Agent.AgentState.Available);
        // var missionSite = new MissionSite(id: i, difficulty: 1, turnAppeared: 1, expiresIn: 1);
        
        // kja WIP
        // controller.TurnController.HireAgents(1);
        // controller.TurnController.SendAgentsToGatherIntel([agent]);
        // controller.TurnController.SendAgentsToGenerateIncome([agent]);
        // controller.TurnController.SendAgentsToTraining([agent]);
        // controller.TurnController.RecallAgents([agent]);
        // controller.TurnController.LaunchMission(missionSite, [agent]);
        // controller.TurnController.SackAgents([agent]);
        // controller.TurnController.BuyTransportCapacity(1);
        // controller.AdvanceTime();
    }
}