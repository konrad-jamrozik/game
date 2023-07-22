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
        _log = log;
        _capacity = capacity;
    }

    public override void Apply(GameState state)
    {
        int buyingCost = Ruleset.TransportCapacityBuyingCost(_capacity);
        Debug.Assert(state.Assets.Money >= buyingCost);
        _log.Info($"Buy transport capacity. Count: {_capacity}. Cost: {buyingCost}");
        state.Assets.Money -= buyingCost;
        state.Assets.MaxTransportCapacity += _capacity;

    }
}