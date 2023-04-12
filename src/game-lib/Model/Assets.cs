namespace UfoGameLib.Model;

public class Assets
{
    public int CurrentMoney;
    public Agents Agents;
    public int MaxTransportCapacity;
    public int CurrentTransportCapacity;

    public Assets(int currentMoney, Agents agents, int maxTransportCapacity, int currentTransportCapacity)
    {
        CurrentMoney = currentMoney;
        Agents = agents;
        MaxTransportCapacity = maxTransportCapacity;
        CurrentTransportCapacity = currentTransportCapacity;
    }
}