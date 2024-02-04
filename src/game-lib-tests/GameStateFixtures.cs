using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Tests;

public static class GameStateFixtures
{
    public static GameState Get()
    {
        var gs = GameState.NewInitialGameState();
        for (int i = 0; i < 100; i++)
        {
            var agent = new Agent(id: i, turnHired: 1, Agent.AgentState.Available);
            var terminatedAgent = new Agent(id: 100 + i, turnHired: 1, Agent.AgentState.Terminated);
            var missionSite = new MissionSite(id: i, difficulty: 1, turnAppeared: 1, expiresIn: 1);
            var mission = new Mission(id: i, missionSite, agentsSent: 1);
            gs.Assets.Agents.Add(agent);
            gs.TerminatedAgents.Add(terminatedAgent);
            gs.MissionSites.Add(missionSite);
            gs.Missions.Add(mission);
        }

        return gs;
    }
}