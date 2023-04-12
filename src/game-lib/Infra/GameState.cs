using Lib.Json;
using Lib.OS;
using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class GameState
{
    public readonly Timeline Timeline;
    public readonly Assets Assets;
    public readonly MissionSites MissionSites;
    public readonly Missions Missions;

    public GameState(int updateCount, Timeline timeline, Assets assets, MissionSites missionSites, Missions missions)
    {
        UpdateCount = updateCount;
        Timeline = timeline;
        Assets = assets;
        MissionSites = missionSites;
        Missions = missions;
    }

    public static GameState NewInitialGameState()
        => new GameState(
            updateCount: 0,
            new Timeline(CurrentTurn: 1),
            new Assets(CurrentMoney: 100, new Agents(), MaxTransportCapacity: 4, CurrentTransportCapacity: 4),
            new MissionSites(),
            new Missions());

    public int UpdateCount { get; set; }

    // kja for now game ends in 30 turns, to prevent the program from hanging.
    public bool IsGameOver => Assets.CurrentMoney < 0 || Timeline.CurrentTurn > 30;
    public int NextAgentId => Assets.Agents.Count;
    public int NextMissionSiteId => MissionSites.Count;

    public void Save(Dir dir, string saveFileName)
    {
        dir.CreateDirIfNotExists().WriteAllTextAsync(saveFileName, this.ToJsonIndentedUnsafe());
    }
}