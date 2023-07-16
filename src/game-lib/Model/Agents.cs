namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    private readonly bool _terminated;

    public Agents(IEnumerable<Agent>? agents = null, bool terminated = false)
    {
        _terminated = terminated;
        AddRange(agents ?? new List<Agent>());
    }

    public new void Add(Agent agent)
    {
        AssertAliveness(new List<Agent> { agent });
        base.Add(agent);
    }

    // ReSharper disable once MemberCanBePrivate.Global
    public new void AddRange(IEnumerable<Agent> agents)
    {
        List<Agent> agentsList = agents.ToList();
        AssertAliveness(agentsList);
        base.AddRange(agentsList);
    }

    public int UpkeepCost => this.Count * Agent.UpkeepCost;

    public Agents InTransit => this.Where(agent => agent.IsInTransit).ToAgents();

    public Agents ArrivingNextTurn => this.Where(agent => agent.IsArrivingNextTurn).ToAgents();

    public Agents Available => this.Where(agent => agent.IsAvailable).ToAgents();

    public Agents OnMission => this.Where(agent => agent.IsOnMission).ToAgents();

    public Agents GatheringIntel => this.Where(agent => agent.IsGatheringIntel).ToAgents();

    public Agents GeneratingIncome => this.Where(agent => agent.IsGeneratingIncome).ToAgents();

    public Agents CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToAgents();

    public Agents CanBeSentOnMissionNextTurn => this.Where(agent => agent.CanBeSentOnMissionNextTurn).ToAgents();

    public Agents Recallable
        => this.Where(agent => agent.IsRecallable).ToAgents();

    public Agents OnSpecificMission(Mission mission)
        => this.Where(agent => agent.IsOnMission && agent.CurrentMission == mission).ToAgents();

    public void AssertCanBeSentOnMission()
        => Debug.Assert(this.All(agent => agent.CanBeSentOnMission));

    private void AssertAliveness(IEnumerable<Agent> agents)
    {
        if (_terminated)
            AssertTerminated(agents);
        else
            AssertAlive(agents);
    }

    private void AssertTerminated(IEnumerable<Agent> agents)
        => Debug.Assert(agents.All(agent => agent.IsTerminated));

    private void AssertAlive(IEnumerable<Agent> agents)
        => Debug.Assert(agents.All(agent => agent.IsAlive));
}