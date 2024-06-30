using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class LaunchMissionPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly MissionIdGen _missionIdGen;
    private readonly MissionSite _site;
    private readonly Agents _agents;

    public LaunchMissionPlayerAction(ILog log, MissionIdGen missionIdGen, MissionSite site, Agents agents)
    {
        Contract.Assert(agents.Any());
        agents.AssertCanBeSentOnMission();
        _log = log;
        _missionIdGen = missionIdGen;
        _site = site;
        _agents = agents;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        Contract.Assert(state.MissionSites.Contains(_site));
        Contract.Assert(_site.IsActive);
        Contract.Assert(_agents.Count > 0);
        _agents.ForEach(agent => Contract.Assert(agent.CanBeSentOnMission));
        Contract.Assert(state.Assets.CurrentTransportCapacity >= _agents.Count);
        Contract.Assert(
            _agents.Count >= _site.RequiredSurvivingAgentsForSuccess,
            $"Cannot launch a mission with not enough agents to win it! " +
            $"_agents.Count: {_agents.Count} " +
            $">= _site.RequiredSurvivingAgentsForSuccess: {_site.RequiredSurvivingAgentsForSuccess}");

        int missionId = _missionIdGen.Generate;
        var mission = new Mission(missionId, _site, state.Timeline.CurrentTurn, _agents.Count);

        Contract.Assert(_agents.All(agent => AgentSurvivalRoll.AgentCanSurvive(agent, mission)));

        state.Missions.Add(mission);

        _agents.ForEach(agent => agent.SendOnMission(mission));

        state.Assets.CurrentTransportCapacity -= _agents.Count;

        _log.Debug($"Launch {mission.LogString}, {_site.LogString}, AgentCount: {_agents.Count}");

        return (ids: [mission.Id, .. _agents.Ids], targetId: _site.Id);
    }
}
