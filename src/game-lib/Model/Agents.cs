namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    public List<Agent> Available => this.Where(agent => agent.IsAvailable).ToList();

    public List<Agent> CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToList();

    public int TotalUpkeepCost => Count * Agent.UpkeepCost;
}