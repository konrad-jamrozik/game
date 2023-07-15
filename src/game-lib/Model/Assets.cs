namespace UfoGameLib.Model;

public class Assets
{
    public int CurrentMoney;
    public int CurrentTransportCapacity;
    public int Funding;
    public int MaxTransportCapacity;
    public readonly Agents Agents;

    public Assets(int currentMoney, int currentTransportCapacity, int funding, int maxTransportCapacity, Agents agents)
    {
        CurrentMoney = currentMoney;
        CurrentTransportCapacity = currentTransportCapacity;
        Funding = funding;
        MaxTransportCapacity = maxTransportCapacity;
        Agents = agents;
    }
}