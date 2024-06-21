using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Model;

public class Faction : IIdentifiable
{
    public int Id { get; }
    public readonly string Name;
    public int Power;
    /// <summary>
    /// The number of times the time must be advanced for a new mission site to be generated.
    /// When it is 1 and the time is advanced, a new mission site is generated and the countdown is reset.
    /// </summary>
    public int MissionSiteCountdown;
    public int PowerIncrease;
    public readonly int PowerAcceleration; // More derivatives: https://en.wikipedia.org/wiki/Fourth,_fifth,_and_sixth_derivatives_of_position
    public int AccumulatedPowerAcceleration;
    public readonly int IntelInvested;


    [JsonConstructor]
    public Faction(
        int id,
        string name,
        int power,
        int missionSiteCountdown,
        int powerIncrease,
        int powerAcceleration,
        int accumulatedPowerAcceleration,
        int intelInvested)
    {
        Id = id;
        Name = name;
        Power = power;
        MissionSiteCountdown = missionSiteCountdown;
        PowerIncrease = powerIncrease;
        PowerAcceleration = powerAcceleration;
        AccumulatedPowerAcceleration = accumulatedPowerAcceleration;
        IntelInvested = intelInvested;
    }

    public static Faction Init(
        IRandomGen randomGen,
        int id,
        string name,
        int power,
        int? powerIncrease = null,
        int? powerAcceleration = null)
        => new(
            id,
            name,
            power,
            randomGen.RandomizeMissionSiteCountdown(),
            powerIncrease ?? 0,
            powerAcceleration ?? 0,
            accumulatedPowerAcceleration: 0,
            intelInvested: 0);

    public Faction DeepClone()
        => new(Id, Name, Power, MissionSiteCountdown, PowerIncrease, PowerAcceleration, AccumulatedPowerAcceleration, IntelInvested);

    public List<MissionSite> CreateMissionSites(
        ILog log,
        IRandomGen randomGen,
        MissionSiteIdGen missionSiteIdGen,
        GameState state)
    {
        Contract.Assert(MissionSiteCountdown >= 1);

        MissionSiteCountdown--;
        if (MissionSiteCountdown >= 1)
            return [];

        Contract.Assert(MissionSiteCountdown == 0);
        // Example when countdown is always reset to 3.
        // Observe that turn 1 is "special" as it is the only turn that reset mission
        // countdown without having a mission itself.
        // Turn | Countdown | Mission generated?
        // 1    | 3         | No
        // 2    | 2         | No
        // 3    | 1         | No
        // 4    | 3         | Yes
        // 5    | 2         | No
        // 6    | 1         | No
        // 7    | 3         | Yes
        MissionSiteCountdown = randomGen.RandomizeMissionSiteCountdown();

        // kja2-simul-feat to make simulation more interesting: create easier missions from time to time and
        // make AI player send less experienced soldiers on it.
        List<MissionSite> sites = [];
        int siteId = missionSiteIdGen.Generate;
        (int difficulty, int difficultyFromTurn, int roll) =
            Ruleset.RollMissionSiteDifficulty(state.Timeline.CurrentTurn, randomGen);

        var site = new MissionSite(
            siteId,
            this,
            difficulty,
            turnAppeared: state.Timeline.CurrentTurn,
            expiresIn: Ruleset.MissionSiteTurnsUntilExpiration);

        // Note: currently returning only one mission site even though this method supports
        // returning a list.
        sites.Add(site);

        log.Info(
            $"Add {site.LogString} : " +
            $"Faction: {Name}, " +
            $"difficulty: {difficulty,3}, " +
            $"difficultyFromTurn: {difficultyFromTurn,3}, " +
            $"difficultyRoll: {roll,2}.");

        return sites;
    }

    public void AdvanceTime()
    {
        Power += PowerIncrease;
        AccumulatedPowerAcceleration += PowerAcceleration;
        while (AccumulatedPowerAcceleration >= 100)
        {
            AccumulatedPowerAcceleration -= 100;
            PowerIncrease += 1;
        }
    }
}