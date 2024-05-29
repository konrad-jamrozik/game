using System.Text.Json;
using System.Text.Json.Serialization;
using Lib.Json;
using UfoGameLib.Model;
using File = Lib.OS.File;

namespace UfoGameLib.State;

public class GameState : IEquatable<GameState>
{
    public const int MaxTurnLimit = 1000;

    public static readonly JsonSerializerOptions StateJsonSerializerOptions = GetJsonSerializerOptions();
    public readonly Timeline Timeline;
    public readonly Assets Assets;
    public readonly MissionSites MissionSites;
    public readonly Missions Missions;
    public readonly Agents TerminatedAgents;

    public int UpdateCount;

    [JsonConstructor]
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

    public static GameState FromJsonFile(File file)
        => file.ReadJsonInto<GameState>(StateJsonSerializerOptions);

    public void ToJsonFile(File file)
        => file.WriteAllText(ToJsonString());

    public bool IsGameOver => IsGameLost
                              || IsGameWon
                              // This condition is here to protect against infinite loops.
                              || Timeline.CurrentTurn > MaxTurnLimit;

    public bool IsGameLost => Assets.Money < 0
                              || Assets.Funding < 0
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

    public GameState Clone(bool useJsonSerialization = false)
    {
        return useJsonSerialization 
            ? this.Clone(StateJsonSerializerOptions) 
            : DeepClone();
    }

    private GameState DeepClone()
    {
        MissionSites clonedMissionSites = MissionSites.DeepClone();
        Missions clonedMissions = Missions.DeepClone(clonedMissionSites);
        return new GameState(
            updateCount: UpdateCount,
            timeline: Timeline.DeepClone(),
            assets: Assets.DeepClone(clonedMissions),
            missionSites: clonedMissionSites,
            missions: clonedMissions,
            terminatedAgents: TerminatedAgents.DeepClone(clonedMissions, terminated: true));
    }

    public string ToJsonString()
        => this.ToIndentedUnsafeJsonString(StateJsonSerializerOptions);

    public bool Equals(GameState? other)
        => this.Equals(other, StateJsonSerializerOptions);

    public override bool Equals(object? obj)
        => Equals(obj as GameState);

    public override int GetHashCode()
        => this.GetHashCode(StateJsonSerializerOptions);

    public JsonDiff JsonDiffWith(GameState other)
        => new JsonDiff(this, other, StateJsonSerializerOptions);

    private static JsonSerializerOptions GetJsonSerializerOptions()
    {
        // We return 'options' that:
        // 1. use the 'converterOptions' as base options
        // 2. have GameStateJsonConverter as a converter
        // 3. the converter also uses 'converterOptions' as base options
        //
        // In other words, both 'options' and its converter use the same base options: 'converterOptions'.
        //   
        // Note: we couldn't collapse 'options' and 'converterOptions' into one instance, because it would
        // result in an infinite loop: 'options' would use GameStateJsonConverter, which would use 'options', which
        // would use GameStateJsonConverter, which would use 'options'...
        //
        // Note: the JsonStringEnumConverter() defined within converterOptions
        // is a "leaf" converter in the sense it doesn't need any other of the settings
        // defined in the options of which it is part of.

        // Define "base" JsonSerializerOptions that:
        // - do not have converters defined,
        // - are used by the returned 'options' and its converter, GameStateJsonConverter.
        var converterOptions = GameStateJsonConverter.JsonSerializerOptions();

        // Define the "top-level" options to be returned. They use "converterOptions".
        var options = new JsonSerializerOptions(converterOptions);

        // Attach GameStateJsonConverter to 'options'. Now both 'options' and its converter use 'converterOptions'.
        options.Converters.Add(new GameStateJsonConverter());

        return options;
    }
}