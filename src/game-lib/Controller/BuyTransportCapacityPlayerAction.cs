using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

public class BuyTransportCapacityPlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly int _capacity;

    public BuyTransportCapacityPlayerAction(ILog log, int capacity)
    {
        Contract.Assert(capacity >= 1);
        _log = log;
        _capacity = capacity;
    }

    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        int buyingCost = Ruleset.TransportCapacityBuyingCost(_capacity);
        Contract.Assert(state.Assets.Money >= buyingCost);
        _log.Info($"Buy transport capacity. Count: {_capacity}. Cost: {buyingCost}");
        state.Assets.Money -= buyingCost;
        state.Assets.MaxTransportCapacity += _capacity;

        return (ids: [state.Assets.MaxTransportCapacity], targetId: _capacity);
    }
}