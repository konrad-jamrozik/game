namespace UfoGameLib.Model;

public class Assets
{
    public int CurrentMoney;
    public int CurrentIntel;
    public int CurrentTransportCapacity;
    public int Funding;
    public int MaxTransportCapacity;
    public readonly Agents Agents;

    public Assets(
        int currentMoney,
        int currentIntel,
        int currentTransportCapacity,
        int funding,
        int maxTransportCapacity,
        Agents agents)
    {
        CurrentMoney = currentMoney;
        CurrentIntel = currentIntel;
        CurrentTransportCapacity = currentTransportCapacity;
        Funding = funding;
        MaxTransportCapacity = maxTransportCapacity;
        Agents = agents;
    }
}