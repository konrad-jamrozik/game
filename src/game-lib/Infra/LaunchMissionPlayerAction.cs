using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class LaunchMissionPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly MissionSite _site;
    private readonly List<Agent> _agents;

    public LaunchMissionPlayerAction(ILog log, MissionSite site, List<Agent> agents)
    {
        _log = log;
        _site = site;
        _agents = agents;
        // kja2 pass Agents instead of List<Agent> and assert all of them can be launched on a mission
    }

    public override void Apply(GameState state)
    {
        Debug.Assert(state.MissionSites.Contains(_site));
        Debug.Assert(_site.IsActive);
        Debug.Assert(_agents.Count > 0);
        _agents.ForEach(agent => Debug.Assert(agent.CanBeSentOnMission));
        Debug.Assert(state.Assets.CurrentTransportCapacity >= _agents.Count);

        int missionId = state.NextMissionId;
        var mission = new Mission(missionId, _site);
        state.Missions.Add(mission);

        _agents.ForEach(agent => agent.SendOnMission(mission));

        state.Assets.CurrentTransportCapacity -= _agents.Count;

        _log.Info($"Launch mission. MissionId: {mission.Id}, SiteId: {_site.Id}, AgentCount: {_agents.Count}");
    }
}