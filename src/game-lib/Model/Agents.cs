namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    public List<Agent> InTransit => this.Where(agent => agent.IsInTransit).ToList();

    public List<Agent> ArrivingNextTurn => this.Where(agent => agent.IsArrivingNextTurn).ToList();

    public List<Agent> Available => this.Where(agent => agent.IsAvailable).ToList();

    public List<Agent> OnMission => this.Where(agent => agent.IsOnMission).ToList();

    public List<Agent> GatheringIntel => this.Where(agent => agent.IsGatheringIntel).ToList();

    public List<Agent> GeneratingIncome => this.Where(agent => agent.IsGeneratingIncome).ToList();

    public List<Agent> CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToList();

    public List<Agent> CanBeSentOnMissionNextTurn => this.Where(agent => agent.CanBeSentOnMissionNextTurn).ToList();

    public List<Agent> Recallable
        => this.Where(agent => agent.IsRecallable).ToList();

    public int TotalUpkeepCost => Count * Agent.UpkeepCost;
}