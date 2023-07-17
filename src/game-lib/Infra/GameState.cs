using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class GameState
{
    public const int MaxTurnLimit = 1000;
    public readonly Timeline Timeline;
    public readonly Assets Assets;
    public readonly MissionSites MissionSites;
    public readonly Missions Missions;
    public readonly Agents TerminatedAgents;

    public int UpdateCount;

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
            new Timeline(currentTurn: Timeline.InitialTurn),
            new Assets(
                money: 500,
                intel: 0,
                funding: 20,
                currentTransportCapacity: 4,
                maxTransportCapacity: 4,
                agents: new Agents()),
            new MissionSites(),
            new Missions(),
            terminatedAgents: new Agents(terminated: true));

    // The "Timeline.CurrentTurn <= MaxTurnLimit" is to protect against infinite loops.
    public bool IsGameOver => Assets.Money < 0 || Timeline.CurrentTurn > MaxTurnLimit;
    public int NextAgentId => Assets.Agents.Count + TerminatedAgents.Count;
    public int NextMissionId => Missions.Count;
    public int NextMissionSiteId => MissionSites.Count;

    public void Terminate(Agent agent, bool sack = false)
    {
        Assets.Agents.Remove(agent);
        agent.Terminate(sack);
        TerminatedAgents.Add(agent);
    }
}