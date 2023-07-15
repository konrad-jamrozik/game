namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    public Agents(IEnumerable<Agent>? agents = null)
        => AddRange(agents ?? new List<Agent>());

    public int UpkeepCost => Alive.Count * Agent.UpkeepCost;

    public List<Agent> InTransit => this.Where(agent => agent.IsInTransit).ToList();

    public List<Agent> ArrivingNextTurn => this.Where(agent => agent.IsArrivingNextTurn).ToList();

    public List<Agent> Available => this.Where(agent => agent.IsAvailable).ToList();

    public List<Agent> OnMission => this.Where(agent => agent.IsOnMission).ToList();

    public List<Agent> GatheringIntel => this.Where(agent => agent.IsGatheringIntel).ToList();

    public List<Agent> GeneratingIncome => this.Where(agent => agent.IsGeneratingIncome).ToList();

    public List<Agent> CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToList();

    public List<Agent> CanBeSentOnMissionNextTurn => this.Where(agent => agent.CanBeSentOnMissionNextTurn).ToList();

    // kja2 make all other methods return Agents
    // kj2 maybe it would be better to move non-Alive (terminated) agent to a separate collection.
    public Agents Alive => new Agents(this.Where(agent => agent.IsAlive).ToList());

    public List<Agent> Recallable
        => this.Where(agent => agent.IsRecallable).ToList();

    public List<Agent> OnSpecificMission(Mission mission)
        => this.Where(agent => agent.IsOnMission && agent.CurrentMission == mission).ToList();
}