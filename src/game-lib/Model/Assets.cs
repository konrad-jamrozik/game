namespace UfoGameLib.Model;

public class Assets
{
    public readonly Agents Agents;
    public int MaxTransportCapacity;
    public int CurrentMoney;
    public int Funding;
    public int CurrentTransportCapacity;

    public Assets(int currentMoney, int funding, Agents agents, int maxTransportCapacity, int currentTransportCapacity)
    {
        CurrentMoney = currentMoney;
        Funding = funding;
        Agents = agents;
        MaxTransportCapacity = maxTransportCapacity;
        CurrentTransportCapacity = currentTransportCapacity;
    }
}