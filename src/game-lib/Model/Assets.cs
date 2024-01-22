using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class Assets
{
    public int Money;
    public int Intel;
    public int Funding;
    public int Support;
    public int CurrentTransportCapacity;
    public int MaxTransportCapacity;
    public readonly Agents Agents;

    public Assets(
        int money,
        int intel,
        int funding,
        int support,
        int maxTransportCapacity,
        Agents agents) : this(money, intel, funding, support, maxTransportCapacity, maxTransportCapacity, agents)
    {
    }

    [JsonConstructor]
    public Assets(
        int money,
        int intel,
        int funding,
        int support,
        int currentTransportCapacity,
        int maxTransportCapacity,
        Agents agents)
    {
        Debug.Assert(money >= 0);
        Debug.Assert(intel >= 0);
        Debug.Assert(funding >= 0);
        Debug.Assert(support >= 0);
        Debug.Assert(currentTransportCapacity >= 0 && currentTransportCapacity <= maxTransportCapacity);
        Money = money;
        Intel = intel;
        Funding = funding;
        Support = support;
        CurrentTransportCapacity = currentTransportCapacity;
        MaxTransportCapacity = maxTransportCapacity;
        // kja assert here none of the agents are terminated?
        Agents = agents;
    }
}