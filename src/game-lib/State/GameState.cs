using System.Text.Json.Serialization;
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

    public bool IsGameLost => Assets.Money <= 0
                              || Assets.Funding <= 0
                              || Assets.Support <= 0;

    public bool IsGameWon => Assets.Intel >= Ruleset.IntelToWin;

    public int NextAgentId => AllAgents.Count;
    public int NextMissionId => Missions.Count;
    public int NextMissionSiteId => MissionSites.Count;

    public void Terminate(Agent agent, bool sack = false)
    {
        Assets.Agents.Remove(agent);
        agent.Terminate(Timeline.CurrentTurn, sack);
        TerminatedAgents.Add(agent);
    }

    [JsonIgnore]
    public Agents AllAgents => (Assets.Agents.Concat(TerminatedAgents).ToAgents(terminated: null));

    /// <summary>
    /// If game is over the last turn is current turn minus one instead of current turn.
    /// This is because UfoGameLib.Controller.AdvanceTimePlayerAction.Apply
    /// advances the turn to a turn beyond the turn in which the game ended. If we would
    /// use that turn number the reported stats would be weird. E.g. when the game
    /// turn limit was 5, the Timeline.CurrentTurn would be 6, even though in reality
    /// player never get a chance to even see turn 6.
    /// We don't prevent the turn advancement even when game is over to keep
    /// the turn number consistent.
    /// </summary>
    public int LastTurn => Timeline.CurrentTurn - (IsGameOver ? 1 : 0);
}