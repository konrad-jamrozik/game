using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

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
        _log.Info("----- Advancing time");
        _log.Info("");

        // Agents cost upkeep. Note we compute upkeep before evaluating missions.
        // This means that if an agent is lost during the mission, we still pay for their upkeep.
        int agentUpkeep = state.Assets.Agents.UpkeepCost;

        (int successfulMissions, int failedMissions, int agentsTerminated) = EvaluateMissions(state);

        int expiredMissions = UpdateActiveMissionSites(state);

        int fundingChange = Ruleset.ComputeFundingChange(successfulMissions, failedMissions, expiredMissions);
        int supportChange = Ruleset.ComputeSupportChange(successfulMissions, failedMissions, expiredMissions);

        // Note this funding change will get taken into account when computing money change this turn,
        // as money change is computed downstream.
        state.Assets.Funding += fundingChange;
        state.Assets.Support += supportChange;

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;
        
        int incomeGenerated = state.Assets.Agents.GeneratingIncome.Count * Ruleset.IncomeGeneratedPerAgent();

        int moneyChange = Ruleset.ComputeMoneyChange(state.Assets.Funding, incomeGenerated, agentUpkeep);

        state.Assets.Money += moneyChange;

        // Each agent gathers 5 intel per turn.
        int intelGathered = state.Assets.Agents.GatheringIntel.Count * Ruleset.IntelGatheredPerAgent();
        state.Assets.Intel += intelGathered;

        UpdateAgentStates(state);

        // LogTurnInfo(...)

        state.Timeline.CurrentTurn++;

        CreateMissionSites(state);
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

        Agents agentsOnMission = state.Assets.Agents.OnSpecificMission(mission);

        (int agentsSent, int agentsSurviving, int agentsTerminated) = EvaluateAgentsOnMission(state, mission, agentsOnMission);

        int agentsRequired = Ruleset.RequiredSurvivingAgentsForSuccess(mission.Site);
        bool missionSuccessful = Ruleset.MissionSuccessful(mission, agentsSurviving);
        mission.CurrentState = missionSuccessful
            ? Mission.State.Successful
            : Mission.State.Failed;

        UpdateAgentMissionStats(agentsOnMission, missionSuccessful);
        
        _log.Info($"Evaluated {mission.LogString}. result: {mission.CurrentState,7}, " +
                  $"difficulty: {mission.Site.Difficulty}, " +
                  $"agents: surviving / required: {agentsSurviving} / {agentsRequired}, " +
                  $"terminated / sent: {agentsTerminated} / {agentsSent}.");

        return (missionSuccessful, agentsTerminated);
    }

    private static void UpdateAgentMissionStats(Agents agentsOnMission, bool missionSuccessful)
    {
        agentsOnMission.ForEach(
            agent =>
            {
                if (missionSuccessful)
                    agent.MissionsSucceeded++;
                else
                    agent.MissionsFailed++;
            });
    }

    private (int agentsSent, int agentsSurviving, int agentsTerminated) EvaluateAgentsOnMission(
        GameState state,
        Mission mission,
        Agents agentsOnMission)
    {
        int agentsSent = agentsOnMission.Count;
        int agentsSurviving = 0;
        int agentsTerminated = 0;

        foreach (Agent agent in agentsOnMission)
        {
            (bool survived, int recoversIn) = Ruleset.RollForAgentSurvival(agent, mission, _randomGen, _log);

            if (survived)
            {
                agentsSurviving++;
                if (recoversIn > 0)
                    agent.SetRecoversIn(recoversIn);
                else
                    agent.MakeAvailable(onMission: true);
            }
            else
            {
                agentsTerminated++;
                state.Terminate(agent);
            }
        }

        return (agentsSent, agentsSurviving, agentsTerminated);
    }

    private void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.InTransit.ForEach(agent => agent.MakeAvailable());
        state.Assets.Agents.InTraining.ForEach(agent => agent.TurnsTrained++);
        state.Assets.Agents.GeneratingIncome.ForEach(agent => agent.TurnsGeneratingIncome++);
        state.Assets.Agents.GatheringIntel.ForEach(agent => agent.TurnsGatheringIntel++);
        state.Assets.Agents.Recovering.ForEach(agent =>
        {
            agent.TickRecovery();
            if (agent.IsAvailable)
            {
                _log.Info($"{agent.LogString} fully recovered! Skill: {Ruleset.AgentSurvivalSkill(agent),3}.");
            }
        });
    }

    private int UpdateActiveMissionSites(GameState state)
    {
        int expiredMissions = 0;
        state.MissionSites.Active.ForEach(
            missionSite =>
            {
                if (missionSite.ExpiresIn > 0)
                    missionSite.ExpiresIn--;
                else
                {
                    missionSite.IsActive = false;
                    expiredMissions++;
                    _log.Info($"{missionSite.LogString} expired!");
                }
            }
        );
        return expiredMissions;
    }

    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            (int difficulty, int difficultyFromTurn, int roll) =
                Ruleset.RollMissionSiteDifficulty(state.Timeline.CurrentTurn, _randomGen);
            var site = new MissionSite(siteId, difficulty, expiresIn: 3);
            state.MissionSites.Add(site);
            _log.Info($"Add {site.LogString} : " +
                      $"difficulty: {difficulty,3}, " +
                      $"difficultyFromTurn: {difficultyFromTurn,3}, " +
                      $"difficultyRoll: {roll,2}.");
            
        }
    }

    private void LogTurnInfo(
        GameState state,
        int successfulMissions,
        int failedMissions,
        int expiredMissions,
        int agentsTerminated,
        int moneyChange,
        int incomeGenerated,
        int agentUpkeep,
        int intelGathered,
        int fundingChange,
        int supportChange,
        int supportChangeFromMissions,
        int supportChangeFromExpiredMissionSites)
    {
        // The ,4 is alignment specifier per:
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated#structure-of-an-interpolated-string
        _log.Info($"===== Turn {state.Timeline.CurrentTurn,4} :");
        _log.Info(
            $"    | Successful missions: {successfulMissions}, " +
            $"Failed missions: {failedMissions}, " +
            $"Expired missions: {expiredMissions}.");
        _log.Info(
            $"    | Agents alive: {state.Assets.Agents.Count}, " +
            $"Agents terminated this turn: {agentsTerminated}.");
        _log.Info(
            $"    | Money: {state.Assets.Money}, " +
            $"Money change: {moneyChange}, " +
            $"Funding: {state.Assets.Funding}, " +
            $"Income generated: {incomeGenerated}, " +
            $"Agent upkeep: {agentUpkeep}.");
        _log.Info(
            $"    | Intel: {state.Assets.Intel}, " +
            $"Intel gathered: {intelGathered}.");
        _log.Info(
            $"    | Funding: {state.Assets.Funding}, " +
            $"Funding change: {fundingChange}.");
        _log.Info(
            $"    | Support: {state.Assets.Support}, " +
            $"Support change: {supportChange}, " +
            $"Support change from missions: {supportChangeFromMissions}, " +
            $"Support change from expired missions: {supportChangeFromExpiredMissionSites}.");
        _log.Info("");
    }

}