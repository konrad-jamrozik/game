using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class InvestIntelPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly Faction _faction;
    private readonly int _intel;

    public InvestIntelPlayerAction(ILog log, Faction faction, int intel)
    {
        Contract.Assert(intel >= 1);
        _log = log;
        _faction = faction;
        _intel = intel;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        // kja WIP InvestIntelPlayerAction

        Console.Out.WriteLine($"Invest intel. Faction: '{_faction.Name}', Faction ID: {_faction.Id}, Intel: {_intel}");
        _log.Info($"Invest intel. Faction: '{_faction.Name}', Faction ID: {_faction.Id}, Intel: {_intel}");

        return (ids: [_faction.Id], targetId: _intel);
    }
}
