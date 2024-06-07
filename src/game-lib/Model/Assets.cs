using Lib.Contracts;
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
        // We cannot make these assumptions here because we may be calling this ctor while
        // cloning a game state of a game that is over.
        // See GameState.IsGameOver
        // Contract.Assert(money >= 0);
        // Contract.Assert(support >= 0);
        // Contract.Assert(funding >= 0);
        Contract.Assert(intel >= 0);
        Contract.Assert(currentTransportCapacity >= 0 && currentTransportCapacity <= maxTransportCapacity);
        Money = money;
        Intel = intel;
        Funding = funding;
        Support = support;
        CurrentTransportCapacity = currentTransportCapacity;
        MaxTransportCapacity = maxTransportCapacity;
        // kja2 assert here none of the agents are terminated?
        Agents = agents;
    }

    public Assets DeepClone(Missions clonedMissions)
    {
        return new Assets(
            Money,
            Intel,
            Funding,
            Support,
            CurrentTransportCapacity,
            MaxTransportCapacity,
            Agents.DeepClone(clonedMissions, terminated: false));
    }
}