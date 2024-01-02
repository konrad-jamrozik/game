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

    public GameState Clone()
    {
        return this.Clone(StateJsonSerializerOptions);
    }

    public string ToJsonString()
        => this.ToIndentedUnsafeJsonString(StateJsonSerializerOptions);

    public bool Equals(GameState? other)
        => this.Equals(other, StateJsonSerializerOptions);

    public override bool Equals(object? obj)
        => Equals(obj as GameState);

    public override int GetHashCode()
        => this.GetHashCode(StateJsonSerializerOptions);

    private static JsonSerializerOptions GetJsonSerializerOptions()
    {
        // The difference between the returned options and converterOptions
        // is that options has Converters defined, while converterOptions
        // doesn't. If instead we would try to use options in place
        // of converterOptions, then we would end up in infinite loop of:
        // options --> have converter --> the converter has options -->
        // these options have converter --> ...
        //
        // Note that the JsonStringEnumConverter() defined within converterOptions
        // is a "leaf" Converter in the sense it doesn't need any other of the settings
        // defined in the options of which it is part of.

        // Define "base" JsonSerializerOptions that do not have Converters defined.
        var converterOptions = GameStateJsonConverter.JsonSerializerOptions();

        // Define the "top-level" options to be returned, having the same settings
        // as "converterOptions".
        var options = new JsonSerializerOptions(converterOptions);

        // Attach Converters to "options" but not "converterOptions"
        options.Converters.Add(new GameStateJsonConverter());

        return options;
    }
}