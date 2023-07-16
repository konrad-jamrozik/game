using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class GameState
{
    public readonly Timeline Timeline;
    public readonly Assets Assets;
    public readonly MissionSites MissionSites;
    public readonly Missions Missions;
    public readonly Agents TerminatedAgents;

    public GameState(
        int updateCount,
        Timeline timeline,
        Assets assets,
        MissionSites missionSites,
        Missions missions,
        Agents terminatedAgents)
    {
        UpdateCount = updateCount;
        Timeline = timeline;
        Assets = assets;
        MissionSites = missionSites;
        Missions = missions;
        TerminatedAgents = terminatedAgents;
    }

    public static GameState NewInitialGameState()
        => new GameState(
            updateCount: 0,
            new Timeline(currentTurn: 1),
            new Assets(
                currentMoney: 500,
                currentTransportCapacity: 4,
                funding: 20,
                maxTransportCapacity: 4,
                agents: new Agents()),
            new MissionSites(),
            new Missions(),
            terminatedAgents: new Agents());

    public int UpdateCount { get; set; }

    // kja3 for now game ends in 30 turns, to prevent the program from hanging.
    public bool IsGameOver => Assets.CurrentMoney < 0 || Timeline.CurrentTurn > 30;
    public int NextAgentId => Assets.Agents.Count;
    public int NextMissionId => Missions.Count;
    public int NextMissionSiteId => MissionSites.Count;

    public void Terminate(Agent agent)
    {
        Assets.Agents.Remove(agent);
        TerminatedAgents.Add(agent);
        agent.Terminate();
    }
}