using UfoGameLib.Model;

namespace UfoGameLib.State;

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
                money: Ruleset.InitialMoney,
                intel: Ruleset.InitialIntel,
                funding: Ruleset.InitialFunding,
                support: Ruleset.InitialSupport,
                maxTransportCapacity: Ruleset.InitialMaxTransportCapacity,
                agents: new Agents()),
            new MissionSites(),
            new Missions(),
            terminatedAgents: new Agents(terminated: true));

    public bool IsGameOver => IsGameLost 
                              || IsGameWon
                              // This condition is here to protect against infinite loops.
                              || Timeline.CurrentTurn > MaxTurnLimit;

    public bool IsGameLost => Assets.Money == 0
                              || Assets.Funding == 0
                              || Assets.Support == 0;

    public bool IsGameWon => Assets.Intel >= Ruleset.IntelToWin;

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