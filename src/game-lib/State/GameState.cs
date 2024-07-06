using System.Text.Json;
using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using File = Lib.OS.File;

namespace UfoGameLib.State;

public class GameState : IEquatable<GameState>
{
    public const int MaxTurnLimit = 1000;

    public static readonly JsonSerializerOptions JsonSerializerOptions = GetJsonSerializerOptions();
    public readonly Timeline Timeline;
    public readonly Assets Assets;
    public readonly MissionSites MissionSites;
    public readonly Missions Missions;
    public readonly Agents TerminatedAgents;
    public readonly Factions Factions;

    public int UpdateCount;

    [JsonConstructor]
    public GameState(
        int updateCount,
        Timeline timeline,
        Assets assets,
        MissionSites missionSites,
        Missions missions,
        Agents terminatedAgents,
        Factions factions)
    {
        UpdateCount = updateCount;
        Timeline = timeline;
        Assets = assets;
        MissionSites = missionSites;
        Missions = missions;
        TerminatedAgents = terminatedAgents;
        Factions = factions;
        AssertInvariants();
    }

    public static GameState NewInitialGameState(IRandomGen? randomGen = null, Factions? factions = null)
    {
        randomGen ??= new RandomGen();
        return new GameState(
            updateCount: 0,
            new Timeline(currentTurn: Timeline.InitialTurn),
            new Assets(
                money: Ruleset.AssetsRuleset.InitialMoney,
                intel: Ruleset.AssetsRuleset.InitialIntel,
                funding: Ruleset.AssetsRuleset.InitialFunding,
                support: Ruleset.AssetsRuleset.InitialSupport,
                maxTransportCapacity: Ruleset.AssetsRuleset.InitialMaxTransportCapacity,
                agents: new Agents()),
            new MissionSites(),
            new Missions(),
            terminatedAgents: new Agents(terminated: true),
            factions: factions ?? Ruleset.FactionsRuleset.InitFactions(randomGen));
    }

    public void AssertInvariants()
    {
        IdGen.AssertConsecutiveIds(MissionSites);
        IdGen.AssertConsecutiveIds(Missions);
        IdGen.AssertConsecutiveIds(AllAgents.OrderBy(agent => agent.Id).ToList());
    }

    public static GameState FromJsonFile(File file)
        => file.ReadJsonInto<GameState>(JsonSerializerOptions);

    public void ToJsonFile(File file)
        => file.WriteAllText(ToJsonString());

    public bool IsGameOver => IsGameLost
                              || IsGameWon
                              // This condition is here to protect against infinite loops.
                              || Timeline.CurrentTurn > MaxTurnLimit;

    public bool IsGameLost => Assets.Money < 0
                              || Assets.Support <= 0;

    public bool IsGameWon => Factions.AllDefeated;

    public void Terminate(Agent agent, bool sack = false)
    {
        Contract.Assert(Assets.Agents.Contains(agent));
        Assets.Agents.Remove(agent);
        agent.Terminate(Timeline.CurrentTurn, sack);
        TerminatedAgents.Add(agent);
    }

    [JsonIgnore]
    public Agents AllAgents => (Assets.Agents.Concat(TerminatedAgents).ToAgents(terminated: null));

    public GameState Clone(bool useJsonSerialization = false)
    {
        return useJsonSerialization 
            ? this.Clone(JsonSerializerOptions) 
            : DeepClone();
    }

    private GameState DeepClone()
    {
        Factions clonedFactions = Factions.DeepClone();
        MissionSites clonedMissionSites = MissionSites.DeepClone(clonedFactions);
        Missions clonedMissions = Missions.DeepClone(clonedMissionSites);
        return new GameState(
            updateCount: UpdateCount,
            timeline: Timeline.DeepClone(),
            assets: Assets.DeepClone(clonedMissions),
            missionSites: clonedMissionSites,
            missions: clonedMissions,
            terminatedAgents: TerminatedAgents.DeepClone(clonedMissions, terminated: true),
            factions: clonedFactions);
    }

    public string ToJsonString()
        => this.ToIndentedUnsafeJsonString(JsonSerializerOptions);

    public bool Equals(GameState? other)
        => this.Equals(other, JsonSerializerOptions);

    public override bool Equals(object? obj)
        => Equals(obj as GameState);

    public override int GetHashCode()
        => this.GetHashCode(JsonSerializerOptions);

    public JsonDiff JsonDiffWith(GameState other)
        => new JsonDiff(this, other, JsonSerializerOptions);

    private static JsonSerializerOptions GetJsonSerializerOptions()
    {
        var options = new JsonSerializerOptions();
        options.Converters.Add(new GameStateJsonConverter());
        return options;
    }
}