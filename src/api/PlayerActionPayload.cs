using UfoGameLib.Controller;
using UfoGameLib.Model;

namespace UfoGameLib.Api;

public class PlayerActionPayload
{
    public readonly string Action = "undefined";
    public readonly string[]? Ids = [];

    public void Apply(GameSessionController controller)
    {
        // int i = 1;
        // var agent = new Agent(id: i, turnHired: 1, Agent.AgentState.Available);
        // var missionSite = new MissionSite(id: i, difficulty: 1, turnAppeared: 1, expiresIn: 1);


        Console.Out.WriteLine($"Called PlayerActionsPayload.Apply(). Action: {Action}");
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