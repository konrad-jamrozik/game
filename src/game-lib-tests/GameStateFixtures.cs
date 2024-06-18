using Lib.Data;
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
            bool isExpired = i % 2 == 0;
            var missionSite = new MissionSite(
                id: i,
                gs.Factions[i % gs.Factions.Count],
                difficulty: 1,
                turnAppeared: 1,
                expiresIn: isExpired ? null : 1,
                turnDeactivated: isExpired ? 2 : null,
                expired: isExpired);
            var mission = new Mission(id: i, missionSite, agentsSent: 1);
            gs.Assets.Agents.Add(agent);
            gs.TerminatedAgents.Add(terminatedAgent);
            gs.MissionSites.Add(missionSite);
            gs.Missions.Add(mission);
        }

        gs.AssertInvariants();
        return gs;
    }
}