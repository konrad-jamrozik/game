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

        // Agents cost upkeep. Note we compute upkeep before evaluating missions.
        // This means that if an agent is lost during the mission, we still pay for their upkeep.
        int agentUpkeep = state.Assets.Agents.UpkeepCost;

        (int successfulMissions, int failedMissions, int agentsTerminated) = EvaluateMissions(state);

        int fundingChange = Ruleset.ComputeFundingChange(successfulMissions, failedMissions);
        int supportChange = Ruleset.ComputeSupportChange(successfulMissions, failedMissions);

        // Note this funding change will get taken into account when computing money change this turn.
        state.Assets.Funding += fundingChange;
        state.Assets.Support += supportChange;

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;
        
        int incomeGenerated = state.Assets.Agents.GeneratingIncome.Count * Ruleset.IncomeGeneratedPerAgent();

        int moneyChange = state.Assets.Funding + incomeGenerated - agentUpkeep;

        state.Assets.Money += moneyChange;

        // Each agent gathers 5 intel per turn.
        int intelGathered = state.Assets.Agents.GatheringIntel.Count * Ruleset.IntelGatheredPerAgent();
        state.Assets.Intel += intelGathered;

        UpdateAgentStates(state);

        CreateMissionSites(state);

        // The ,4 is alignment specifier per:
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated#structure-of-an-interpolated-string
        _log.Info($"===== Turn {state.Timeline.CurrentTurn,4} :");
        _log.Info($"    | Successful missions: {successfulMissions}, " +
                  $"Failed missions: {failedMissions}.");
        _log.Info($"    | Agents alive: {state.Assets.Agents.Count}, " +
                  $"Agents terminated this turn: {agentsTerminated}.");
        _log.Info($"    | Money: {state.Assets.Money}, " +
                  $"Money change: {moneyChange}, " +
                  $"Funding: {state.Assets.Funding}, " +
                  $"Income generated: {incomeGenerated}, " +
                  $"Agent upkeep: {agentUpkeep}.");
        _log.Info($"    | Intel: {state.Assets.Intel}, " +
                  $"Intel gathered: {intelGathered}.");
        _log.Info($"    | Funding: {state.Assets.Funding}, " +
                  $"Funding change: {fundingChange}.");
        _log.Info($"    | Support: {state.Assets.Support}, " +
                  $"Support change: {supportChange}.");
        _log.Info("");
    }

    private (int successfulMissions, int failedMissions, int totalAgentsTerminated) EvaluateMissions(GameState state)
    {
        int totalAgentsTerminated = 0;
        int successfulMissions = 0;
        int failedMissions = 0;

        foreach (Mission mission in state.Missions.Active)
        {
            (bool missionSuccess, int agentsTerminated) = EvaluateMission(state, mission);

            totalAgentsTerminated += agentsTerminated;
            if (missionSuccess)
                successfulMissions++;
            else
                failedMissions++;
        }

        return (successfulMissions, failedMissions, totalAgentsTerminated);
    }

    private (bool success, int agentsTerminated) EvaluateMission(GameState state, Mission mission)
    {
        Debug.Assert(mission.CurrentState == Mission.State.Active);

        (int agentsSent, int agentsSurviving, int agentsTerminated) = EvaluateAgentsOnMission(state, mission);

        int agentsRequired = Ruleset.RequiredSurvivingAgentsForSuccess(mission.Site);
        bool missionSuccessful = Ruleset.MissionSuccessful(mission, agentsSurviving);
        mission.CurrentState = missionSuccessful
            ? Mission.State.Success
            : Mission.State.Failed;
        
        _log.Info($"Evaluated mission with ID {mission.Id}. result: {mission.CurrentState,7}, " +
                  $"difficulty: {mission.Site.Difficulty}, " +
                  $"agents: surviving / required: {agentsSurviving} / {agentsRequired}, " +
                  $"terminated / sent: {agentsTerminated} / {agentsSent}.");

        return (missionSuccessful, agentsTerminated);
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