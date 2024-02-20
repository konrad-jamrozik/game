using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Primitives;

namespace UfoGameLib.Model;

public class Agents : List<Agent>
{
    private readonly bool? _terminated;

    [JsonConstructor]
    public Agents()
    {
    }

    public Agents(IEnumerable<Agent>? agents = null, bool? terminated = false)
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

    public int UpkeepCost => Count * Ruleset.AgentUpkeepCost;

    public Agents InTransit => this.Where(agent => agent.IsInTransit).ToAgents();

    public Agents InTraining => this.Where(agent => agent.IsTraining).ToAgents();

    public Agents Recovering => this.Where(agent => agent.IsRecovering).ToAgents();

    public Agents ArrivingNextTurnForSure => this.Where(agent => agent.IsArrivingNextTurnForSure).ToAgents();

    public Agents ArrivingNextTurnMaybe => this.Where(agent => agent.IsArrivingNextTurnMaybe).ToAgents();

    public Agents Available => this.Where(agent => agent.IsAvailable).ToAgents();

    public Agents OnMission => this.Where(agent => agent.IsOnMission).ToAgents();

    public Agents GatheringIntel => this.Where(agent => agent.IsGatheringIntel).ToAgents();

    public Agents GeneratingIncome => this.Where(agent => agent.IsGeneratingIncome).ToAgents();

    public Agents CanBeSentOnMission => this.Where(agent => agent.CanBeSentOnMission).ToAgents();

    public Agents CanBeSentOnMissionNextTurnForSure => this.Where(agent => agent.CanBeSentOnMissionNextTurnForSure).ToAgents();

    public Agents CanBeSentOnMissionNextTurnMaybe => this.Where(agent => agent.CanBeSentOnMissionNextTurnMaybe).ToAgents();

    public Agents CanBeRecalled
        => this.Where(agent => agent.CanBeRecalled).ToAgents();

    public Agents OnSpecificMission(Mission mission)
        => this.Where(agent => agent.IsOnMission && agent.CurrentMission == mission).ToAgents();

    public void AssertCanBeSentOnMission()
        => Contract.Assert(this.All(agent => agent.CanBeSentOnMission));

    public void AssertCanBeSacked()
        => Contract.Assert(this.All(agent => agent.CanBeSacked));

    public Agent AgentAtPercentile(int percentile, Func<Agent, int> orderBy)
        => this.OrderBy(orderBy).TakePercent(percentile).Last();

    
    // kja2 add assertions that all searched agents were found
    public Agents GetByIds(int[] ids) =>
        this.Where(agent => ids.Contains(agent.Id)).ToAgents();

    public Agents DeepClone(Missions clonedMissions, bool terminated)
    {
        return new Agents(this.Select(agent =>
        {
            Mission? clonedMission =
                clonedMissions.SingleOrDefault(clonedMission => clonedMission.Id == agent.CurrentMission?.Id);
            return agent.DeepClone(clonedMission);
        }), terminated);
    }

    private void AssertAliveness(IEnumerable<Agent> agents)
    {
        switch (_terminated)
        {
            case null:
                return;
            case true:
                AssertTerminated(agents);
                break;
            default:
                AssertAlive(agents);
                break;
        }
    }

    private void AssertTerminated(IEnumerable<Agent> agents)
        => Contract.Assert(agents.All(agent => agent.IsTerminated));

    private void AssertAlive(IEnumerable<Agent> agents)
        => Contract.Assert(agents.All(agent => agent.IsAlive));
}