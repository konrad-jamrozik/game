using UfoGameLib.Infra;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.Rules;

namespace UfoGameLib.Controller;

public class AdvanceTimePlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly RandomGen _randomGen;

    public AdvanceTimePlayerAction(ILog log, RandomGen randomGen)
    {
        _log = log;
        _randomGen = randomGen;
    }

    public override void Apply(GameState state)
    {
        _log.Info("");
        _log.Info("----- Evaluating next turn");
        state.Timeline.CurrentTurn++;

  
        int agentsTerminated = EvaluateMissions(state);

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        // Agents cost upkeep.
        int agentUpkeep = state.Assets.Agents.UpkeepCost;

        // Each agent generates income equal to their upkeep times 3.
        int incomeGenerated = state.Assets.Agents.GeneratingIncome.Count * Agent.UpkeepCost * 3;

        int moneyAdjustment = state.Assets.Funding + incomeGenerated - agentUpkeep;

        state.Assets.CurrentMoney += moneyAdjustment;
        state.Assets.CurrentMoney += incomeGenerated;

        // Each agent gathers 5 intel per turn.
        int intelGathered = state.Assets.Agents.GatheringIntel.Count * 5;
        state.Assets.CurrentIntel += intelGathered;

        UpdateAgentStates(state);

        CreateMissionSites(state);

        // The ,4 is alignment specifier per:
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated#structure-of-an-interpolated-string
        _log.Info($"===== Turn {state.Timeline.CurrentTurn,4} :");
        _log.Info($"    | Agents alive: {state.Assets.Agents.Count}, " +
                  $"Agents terminated this turn: {agentsTerminated}.");
        _log.Info($"    | CurrentMoney: {state.Assets.CurrentMoney}, " +
                  $"Money adjustment: {moneyAdjustment}, " +
                  $"Funding: {state.Assets.Funding}, " +
                  $"Income generated: {incomeGenerated}, " +
                  $"Agent upkeep: {agentUpkeep}.");
        _log.Info($"    | CurrentIntel: {state.Assets.CurrentIntel}, " +
                  $"Intel gathered: {intelGathered}.");
        _log.Info("");
    }

    private int EvaluateMissions(GameState state)
    {
        int agentsTerminatedCount = 0;
        foreach (Mission mission in state.Missions.Active)
        {
            int agentsTerminatedOnMissionCount = EvaluateMission(state, mission);

            agentsTerminatedCount += agentsTerminatedOnMissionCount;
        }

        return agentsTerminatedCount;
    }

    private int EvaluateMission(GameState state, Mission mission)
    {
        Debug.Assert(mission.CurrentState == Mission.State.Active);

        (int agentsSent, int agentsSurviving, int agentsTerminated) = EvaluateAgentsOnMission(state, mission);

        int agentsRequired = Ruleset.RequiredSurvivingAgentsForSuccess(mission.Site);
        mission.CurrentState = Ruleset.MissionSuccessful(mission, agentsSurviving)
            ? Mission.State.Success
            : Mission.State.Failed;
        
        _log.Info($"Evaluated mission with ID {mission.Id}. result: {mission.CurrentState,7}, " +
                  $"difficulty: {mission.Site.Difficulty}, " +
                  $"agents: surviving / required: {agentsSurviving} / {agentsRequired}, " +
                  $"terminated / sent: {agentsTerminated} / {agentsSent}.");

        return agentsTerminated;
    }

    private (int agentsSent, int agentsSurviving, int agentsTerminated) EvaluateAgentsOnMission(
        GameState state,
        Mission mission)
    {
        Agents agentsOnMission = state.Assets.Agents.OnSpecificMission(mission);
        
        int agentsSent = agentsOnMission.Count;
        int agentsSurviving = 0;
        int agentsTerminated = 0;

        foreach (Agent agent in agentsOnMission)
        {
            bool survived = Ruleset.RollForAgentSurvival(agent, mission, _randomGen, _log);

            if (survived)
            {
                agent.MakeAvailable();
                agentsSurviving++;
            }
            else
            {
                state.Terminate(agent);
                agentsTerminated++;
            }
        }

        return (agentsSent, agentsSurviving, agentsTerminated);
    }

    private static void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.InTransit.ForEach(agent => agent.MakeAvailable());
        state.Assets.Agents.InTraining.ForEach(agent => agent.TurnsTrained++);
    }

    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            int difficulty = Ruleset.RollMissionSiteDifficulty(state.Timeline.CurrentTurn, _randomGen);
            _log.Info($"Add MissionSite with Id: {siteId}, difficulty: {difficulty}");
            state.MissionSites.Add(new MissionSite(siteId, difficulty));
        }
    }
}