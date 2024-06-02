using Lib.Contracts;
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

        (int successfulMissions, int failedMissions) = EvaluateMissions(state);

        int expiredMissionSites = UpdateActiveMissionSites(state);

        int fundingChange = Ruleset.ComputeFundingChange(successfulMissions, failedMissions, expiredMissionSites);
        int supportChange = Ruleset.ComputeSupportChange(successfulMissions, failedMissions, expiredMissionSites);

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

        state.Timeline.CurrentTurn++;

        CreateMissionSites(state);
    }

    private (int successfulMissions, int failedMissions) EvaluateMissions(GameState state)
    {
        int successfulMissions = 0;
        int failedMissions = 0;

        foreach (Mission mission in state.Missions.Active)
        {
            bool missionSuccessful = EvaluateMission(state, mission);

            if (missionSuccessful)
                successfulMissions++;
            else
                failedMissions++;
        }

        return (successfulMissions, failedMissions);
    }

    private bool EvaluateMission(GameState state, Mission mission)
    {
        Contract.Assert(mission.CurrentState == Mission.MissionState.Active);

        Agents agentsOnMission = state.Assets.Agents.OnSpecificMission(mission);

        (int agentsSurvived, int agentsTerminated) = EvaluateAgentsOnMission(state, mission, agentsOnMission);
        mission.ApplyAgentsResults(agentsSurvived, agentsTerminated);

        int agentsRequired = mission.Site.RequiredSurvivingAgentsForSuccess;
        bool missionSuccessful = Ruleset.MissionSuccessful(mission, agentsSurvived);
        mission.CurrentState = missionSuccessful
            ? Mission.MissionState.Successful
            : Mission.MissionState.Failed;

        // Note: UpdateAgentMissionStats and EvaluateAgentsOnMission are not
        // computed at the same time.
        // This is because UpdateAgentMissionStats depends on Ruleset.MissionSuccessful which
        // depends on EvaluateAgentsOnMission.
        // Specifically, to set given agent's stat on successful missions, we need to
        // know if a mission is successful. To know if a mission is successful,
        // we need to know how many agents survived it. As soon as we know if given agent
        // survived a mission, we set their status.
        UpdateAgentMissionStats(agentsOnMission, missionSuccessful);
        
        _log.Info($"Evaluated {mission.LogString}. result: {mission.CurrentState,7}, " +
                  $"difficulty: {mission.Site.Difficulty,3}, " +
                  $"agents: surviving / required: {agentsSurvived,3} / {agentsRequired,3}, " +
                  $"terminated / sent: {agentsTerminated,3} / {mission.AgentsSent,3}.");

        return missionSuccessful;
    }

    private static void UpdateAgentMissionStats(Agents agentsOnMission, bool missionSuccessful)
    {
        agentsOnMission.ForEach(
            agent =>
            {
                if (agent.IsAlive)
                    agent.MissionsSurvived++;

                if (missionSuccessful)
                    agent.MissionsSucceeded++;
                else
                    agent.MissionsFailed++;
            });
    }

    private (int agentsSurvived, int agentsTerminated) EvaluateAgentsOnMission(
        GameState state,
        Mission mission,
        Agents agentsOnMission)
    {
        int agentsSent = agentsOnMission.Count;
        Contract.Assert(agentsSent == mission.AgentsSent);
        int agentsSurvived = 0;
        int agentsTerminated = 0;

        foreach (Agent agent in agentsOnMission)
        {
            (bool survived, int? recoversIn) = Ruleset.RollForAgentSurvival(_log, _randomGen, agent, mission);

            if (survived)
            {
                agentsSurvived++;
                if (recoversIn > 0)
                    agent.SetRecoversIn(recoversIn);
                else
                    agent.MakeAvailable();
            }
            else
            {
                agentsTerminated++;
                state.Terminate(agent);
            }
        }

        return (agentsSurvived, agentsTerminated);
    }

    private void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.InTransit.ForEach(agent => agent.MakeAvailable());
        state.Assets.Agents.InTraining.ForEach(agent => agent.TurnsInTraining++);
        state.Assets.Agents.GeneratingIncome.ForEach(agent => agent.TurnsGeneratingIncome++);
        state.Assets.Agents.GatheringIntel.ForEach(agent => agent.TurnsGatheringIntel++);
        state.Assets.Agents.Recovering.ForEach(agent =>
        {
            agent.TickRecovery();
            if (agent.IsAvailable)
            {
                _log.Info($"{agent.LogString} fully recovered! Skill: {agent.SurvivalSkill,3}.");
            }
        });
    }

    private int UpdateActiveMissionSites(GameState state)
    {
        int expiredMissions = 0;
        state.MissionSites.Active.ForEach(
            missionSite =>
            {
                var expired = missionSite.TickExpiration(state.Timeline.CurrentTurn);
                if (expired)
                {
                    expiredMissions++;
                    _log.Info($"{missionSite.LogString} expired!");
                }
            }
        );
        return expiredMissions;
    }

    // kja2-simul-feat to make simulation more interesting: create easier missions from time to time and
    // make AI player send less experienced soldiers on it.
    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            (int difficulty, int difficultyFromTurn, int roll) =
                Ruleset.RollMissionSiteDifficulty(state.Timeline.CurrentTurn, _randomGen);
            var site = new MissionSite(siteId, difficulty, turnAppeared: state.Timeline.CurrentTurn, expiresIn: 3);
            state.MissionSites.Add(site);
            _log.Info($"Add {site.LogString} : " +
                      $"difficulty: {difficulty,3}, " +
                      $"difficultyFromTurn: {difficultyFromTurn,3}, " +
                      $"difficultyRoll: {roll,2}.");
        }
    }
}