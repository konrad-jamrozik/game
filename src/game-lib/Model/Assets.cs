using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class Assets
{
    public int Money;
    public int Intel;
    public int Funding;
    public int CurrentTransportCapacity;
    public int MaxTransportCapacity;
    public readonly Agents Agents;

    public Assets(
        int money,
        int intel,
        int funding,
        int maxTransportCapacity,
        Agents agents) : this(money, intel, funding, maxTransportCapacity, maxTransportCapacity, agents)
    {
    }

    [JsonConstructor]
    public Assets(
        int money,
        int intel,
        int funding,
        int currentTransportCapacity,
        int maxTransportCapacity,
        Agents agents)
    {
        Debug.Assert(funding >= 0);
        Debug.Assert(currentTransportCapacity >= 0 && currentTransportCapacity <= maxTransportCapacity);
        Money = money;
        Intel = intel;
        Funding = funding;
        CurrentTransportCapacity = currentTransportCapacity;
        MaxTransportCapacity = maxTransportCapacity;
        Agents = agents;
    }
}