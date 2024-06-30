using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class TimeAdvancementController
{
    private readonly ILog _log;
    private readonly IRandomGen _randomGen;
    private readonly List<WorldEvent> _worldEvents;
    private readonly EventIdGen _eventIdGen;
    private readonly MissionSiteIdGen _missionSiteIdGen;

    public TimeAdvancementController(
        ILog log,
        IRandomGen randomGen,
        EventIdGen eventIdGen,
        MissionSiteIdGen missionSiteIdGen)
    {
        _log = log;
        _randomGen = randomGen;
        _eventIdGen = eventIdGen;
        _missionSiteIdGen = missionSiteIdGen;
        _worldEvents = new List<WorldEvent>();
    }

    public (PlayerActionEvent advanceTimeEvent, List<WorldEvent> worldEvents) AdvanceTime(GameState state)
    {
        _log.Info("");
        _log.Info("----- Advancing time");
        _log.Info("");

        PlayerActionEvent advanceTimeEvent = new PlayerActionEvent(
            _eventIdGen.Generate,
            GameEventName.AdvanceTimePlayerAction,
            targetId: state.Timeline.CurrentTurn);

        // Agents cost upkeep. Note we compute upkeep before evaluating missions.
        // This means that if an agent is lost during the mission, we still pay for their upkeep.
        int agentUpkeep = state.Assets.Agents.UpkeepCost;

        (List<Mission> successfulMissions, List<Mission> failedMissions) = EvaluateMissions(state);

        List<MissionSite> expiredMissionSites = UpdateActiveMissionSites(state);

        int moneyChange = Ruleset.ComputeMoneyChange(state.Assets, successfulMissions, agentUpkeep);
        int intelChange = Ruleset.ComputeIntelChange(state.Assets, successfulMissions);
        int fundingChange = Ruleset.ComputeFundingChange(successfulMissions, failedMissions, expiredMissionSites);
        int supportChange = Ruleset.ComputeSupportChange(successfulMissions, failedMissions, expiredMissionSites);

        state.Assets.Money += moneyChange;
        state.Assets.Intel = Math.Max(0, state.Assets.Intel + intelChange);
        state.Assets.Funding = Math.Max(0, state.Assets.Funding + fundingChange);
        state.Assets.Support = Math.Max(0, state.Assets.Support + supportChange);

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        UpdateAgentStates(state);

        state.Timeline.CurrentTurn++;

        CreateMissionSites(state);

        _worldEvents.Add(
            new WorldEvent(
                _eventIdGen.Generate,
                GameEventName.ReportEvent,
                [moneyChange, intelChange, fundingChange, supportChange]));
        var worldEvents = new List<WorldEvent>(_worldEvents);
        _worldEvents.Clear();

        state.Factions.AdvanceTime(successfulMissions);
        
        state.AssertInvariants();
        return (advanceTimeEvent, worldEvents);
    }

    private (List<Mission> successful, List<Mission> failed) EvaluateMissions(GameState state)
    {
        var successfulMissions = new List<Mission>();
        var failedMissions = new List<Mission>();

        foreach (Mission mission in state.Missions.Active)
        {
            bool missionSuccessful = EvaluateMission(state, mission);
            if (missionSuccessful)
                successfulMissions.Add(mission);
            else
                failedMissions.Add(mission);
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

    private List<MissionSite> UpdateActiveMissionSites(GameState state)
    {
        var expiredMissionSites = new List<MissionSite>();    
        state.MissionSites.Active.ForEach(
            missionSite =>
            {
                var expired = missionSite.TickExpiration(state.Timeline.CurrentTurn);
                if (expired)
                {
                    expiredMissionSites.Add(missionSite);
                    _worldEvents.Add(
                        new WorldEvent(
                            _eventIdGen.Generate,
                            GameEventName.MissionSiteExpiredEvent,
                            targetId: missionSite.Id));
                    _log.Info($"{missionSite.LogString} expired!");
                }
            }
        );
        return expiredMissionSites;
    }
    private void CreateMissionSites(GameState state)
    {
        List<MissionSite> missionSites = state.Factions.CreateMissionSites(_log, _randomGen, _missionSiteIdGen, state);
        state.MissionSites.AddRange(missionSites);
    }
}