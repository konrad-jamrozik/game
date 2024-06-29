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
    public double Power;
    /// <summary>
    /// The number of times the time must be advanced for a new mission site to be generated.
    /// When it is 1 and the time is advanced, a new mission site is generated and the countdown is reset.
    /// </summary>
    public int MissionSiteCountdown;
    public double PowerClimb;
    public double PowerAcceleration; // More derivatives: https://en.wikipedia.org/wiki/Fourth,_fifth,_and_sixth_derivatives_of_position
    // kja implement: the more intel invested, the more faction damage missions are doing
    // kja-refactor introduce "IntelRuleset", "MoneyRuleset" etc. It will make things easier to balance.
    public int IntelInvested;


    [JsonConstructor]
    public Faction(
        int id,
        string name,
        double power,
        int missionSiteCountdown,
        double powerClimb,
        double powerAcceleration,
        int intelInvested)
    {
        Id = id;
        Name = name;
        Power = power;
        MissionSiteCountdown = missionSiteCountdown;
        PowerClimb = powerClimb;
        PowerAcceleration = powerAcceleration;
        IntelInvested = intelInvested;
    }

    [JsonIgnore]
    public int PowerAsInt => (int)Math.Floor(Power);

    public static Faction Init(
        IRandomGen randomGen,
        int id,
        string name,
        double power,
        double? powerClimb = null,
        double? powerAcceleration = null)
        => new(
            id,
            name,
            power,
            randomGen.RandomizeMissionSiteCountdown(),
            powerClimb ?? 0,
            powerAcceleration ?? 0,
            intelInvested: 0);

    public Faction DeepClone()
        => new Faction(
            Id,
            Name,
            Power,
            MissionSiteCountdown,
            PowerClimb,
            PowerAcceleration,
            IntelInvested);

    public List<MissionSite> CreateMissionSites(
        ILog log,
        IRandomGen randomGen,
        MissionSiteIdGen missionSiteIdGen,
        GameState state)
    {
        Contract.Assert(MissionSiteCountdown >= 1);

        if (Power == 0)
            return [];

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
        (int difficulty, double baseDifficulty, double variationRoll) =
            Ruleset.RollMissionSiteDifficulty(randomGen, this);

        var site = new MissionSite(
            siteId,
            this,
            MissionSiteModifiers.Compute(randomGen, this, difficulty),
            difficulty,
            turnAppeared: state.Timeline.CurrentTurn,
            expiresIn: Ruleset.MissionSiteTurnsUntilExpiration);

        // Note: currently returning only one mission site even though this method supports
        // returning a list.
        sites.Add(site);

        Console.WriteLine(
            "kja temp debug " + 
            $"Add {site.LogString} : " +
            $"Faction: {Name,20}, " +
            $"difficulty: {difficulty,3}, " +
            $"baseDifficulty: {baseDifficulty,5:F2}, " +
            $"variationRoll: {variationRoll,5:F2}.");
        log.Info(
            $"Add {site.LogString} : " +
            $"Faction: {Name,20}, " +
            $"difficulty: {difficulty,3}, " +
            $"baseDifficulty: {baseDifficulty,5:F2}, " +
            $"variationRoll: {variationRoll,5:F2}.");

        return sites;
    }

    public void AdvanceTime(List<Mission> successfulMissions)
    {
        Power = Math.Max(0, Power - successfulMissions.Sum(mission => mission.Site.Modifiers.PowerDamageReward));
        
        PowerClimb = Math.Max(
            0,
            PowerClimb - successfulMissions.Sum(mission => mission.Site.Modifiers.PowerClimbDamageReward));
        
        PowerAcceleration = Math.Max(
            0,
            PowerAcceleration -
            successfulMissions.Sum(mission => mission.Site.Modifiers.PowerAccelerationDamageReward));

        if (Power == 0)
            return;

        Power += PowerClimb;
        PowerClimb += PowerAcceleration;
    }
}
