using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class LaunchMissionPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly MissionSite _site;
    private readonly Agents _agents;

    public LaunchMissionPlayerAction(ILog log, MissionSite site, Agents agents)
    {
        agents.AssertCanBeSentOnMission();
        _log = log;
        _site = site;
        _agents = agents;
    }

    public override void Apply(GameState state)
    {
        Debug.Assert(state.MissionSites.Contains(_site));
        Debug.Assert(_site.IsActive);
        Debug.Assert(_agents.Count > 0);
        _agents.ForEach(agent => Debug.Assert(agent.CanBeSentOnMission));
        Debug.Assert(state.Assets.CurrentTransportCapacity >= _agents.Count);
        Debug.Assert(_agents.Count >= Ruleset.RequiredSurvivingAgentsForSuccess(_site), 
            $"Cannot launch a mission with not enough agents to win it! " +
            $"_agents.Count: {_agents.Count} " +
            $">= _site.RequiredSurvivingAgentsForSuccess: {Ruleset.RequiredSurvivingAgentsForSuccess(_site)}");

        int missionId = state.NextMissionId;
        var mission = new Mission(missionId, _site);

        Debug.Assert(_agents.All(agent => Ruleset.AgentCanSurvive(agent, mission)));

        state.Missions.Add(mission);

        _agents.ForEach(agent => agent.SendOnMission(mission));

        state.Assets.CurrentTransportCapacity -= _agents.Count;

        _log.Info($"Launch {mission}, {_site}, AgentCount: {_agents.Count}");
    }
}