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
    public readonly int Power;
    public int MissionSiteCountdown;
    public readonly int PowerIncrease;
    public readonly int PowerAcceleration;
    public readonly int IntelInvested;


    [JsonConstructor]
    public Faction(
        int id,
        string name,
        int power,
        int missionSiteCountdown,
        int powerIncrease,
        int powerAcceleration,
        int intelInvested)
    {
        Id = id;
        Name = name;
        Power = power;
        MissionSiteCountdown = missionSiteCountdown;
        PowerIncrease = powerIncrease;
        PowerAcceleration = powerAcceleration;
        IntelInvested = intelInvested;
    }

    public static Faction Init(
        RandomGen randomGen,
        int id,
        string name,
        int power,
        int? powerIncrease = null,
        int? powerAcceleration = null)
        => new(
            id,
            name,
            power,
            RandomizeMissionSiteCountdown(randomGen),
            powerIncrease ?? 0,
            powerAcceleration ?? 0,
            0);

    public Faction DeepClone()
        => new(Id, Name, Power, MissionSiteCountdown, PowerIncrease, PowerAcceleration, IntelInvested);

    public List<MissionSite> CreateMissionSites(ILog log, RandomGen randomGen, GameState state)
    {
        Contract.Assert(MissionSiteCountdown >= 1);

        MissionSiteCountdown--;
        if (MissionSiteCountdown > 0)
            return [];

        Contract.Assert(MissionSiteCountdown == 0);
        MissionSiteCountdown = RandomizeMissionSiteCountdown(randomGen);

        // kja2-simul-feat to make simulation more interesting: create easier missions from time to time and
        // make AI player send less experienced soldiers on it.
        List<MissionSite> sites = [];
        // kja BUG ROOT CAUSE: this must increase the ID, right now it does not.
        int siteId = state.NextMissionSiteId;
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

    private static int RandomizeMissionSiteCountdown(RandomGen randomGen)
        => randomGen.Roll(Ruleset.FactionMissionSiteCountdown);
}