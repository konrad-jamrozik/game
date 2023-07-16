namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    public Agents(IEnumerable<Agent>? agents = null)
        => AddRange(agents ?? new List<Agent>());

    public int UpkeepCost => Alive.Count * Agent.UpkeepCost;

    public Agents InTransit => this.Where(agent => agent.IsInTransit).ToAgents();

    public Agents ArrivingNextTurn => this.Where(agent => agent.IsArrivingNextTurn).ToAgents();

    public Agents Available => this.Where(agent => agent.IsAvailable).ToAgents();

    public Agents OnMission => this.Where(agent => agent.IsOnMission).ToAgents();

    public Agents GatheringIntel => this.Where(agent => agent.IsGatheringIntel).ToAgents();

    public Agents GeneratingIncome => this.Where(agent => agent.IsGeneratingIncome).ToAgents();

    public Agents CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToAgents();

    public Agents CanBeSentOnMissionNextTurn => this.Where(agent => agent.CanBeSentOnMissionNextTurn).ToAgents();

    // kj2 maybe it would be better to move non-Alive (terminated) agent to a separate collection.
    public Agents Alive => this.Where(agent => agent.IsAlive).ToAgents();

    public Agents Recallable
        => this.Where(agent => agent.IsRecallable).ToAgents();

    public Agents OnSpecificMission(Mission mission)
        => this.Where(agent => agent.IsOnMission && agent.CurrentMission == mission).ToAgents();

    public void AssertCanBeSentOnMission()
        => Debug.Assert(this.All(agent => agent.CanBeSentOnMission));
}