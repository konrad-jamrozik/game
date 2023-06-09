using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class LaunchMissionPlayerAction : PlayerAction
{
    private readonly MissionSite _site;
    private readonly List<Agent> _agents;

    public LaunchMissionPlayerAction(MissionSite site, List<Agent> agents)
    {
        _site = site;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        Console.Out.WriteLine($"PlayerAction: Launch mission. SiteId: {_site.Id} AgentCount: {_agents.Count}");

        Debug.Assert(state.MissionSites.Contains(_site));
        Debug.Assert(_site.IsActive);
        Debug.Assert(_agents.Any());
        _agents.ForEach(agent => Debug.Assert(agent.CanBeSentOnMission));
        Debug.Assert(state.Assets.CurrentTransportCapacity >= _agents.Count);

        _agents.ForEach(agent => agent.SendOnMission());

        state.Missions.Add(new Mission(_site));
        state.Assets.CurrentTransportCapacity -= _agents.Count;
    }
}