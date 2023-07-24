using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public enum State
    {
        Active,
        Successful,
        Failed
    }

    public readonly int AgentsSent;

    public MissionSite Site;
    public State CurrentState;

    // kja simplif y tor
    public Mission(int id, MissionSite site, int turn, int agentsSent) : this(
        id, 
        // This mission just got constructed so it is active until it gets evaluated
        // on time advancement.
        State.Active, 
        site,
        agentsSent)
    {
        Debug.Assert(site.IsActive);
        site.LaunchMission(turn);
    }

    [JsonConstructor]
    public Mission(
        int id,
        State currentState,
        MissionSite site,
        int agentsSent,
        int? agentsSurvived = null,
        int? agentsTerminated = null)
    {
        Id = id;
        Site = site;
        CurrentState = currentState;
        AgentsSent = agentsSent;
        AgentsSurvived = agentsSurvived;
        AgentsTerminated = agentsTerminated;
    }

    public int? AgentsSurvived { get; private set; }
    public int? AgentsTerminated { get; private set; }

    [JsonIgnore]
    public bool IsActive => CurrentState == State.Active;

    [JsonIgnore]
    public bool IsSuccessful => CurrentState == State.Successful;

    [JsonIgnore]
    public bool IsFailed => CurrentState == State.Failed;

    [JsonIgnore]
    public bool WasLaunched => IsSuccessful || IsFailed;

    public int Id { get; }

    [JsonIgnore]
    public string LogString => $"MissionID: {Id,3}";

    public void ApplyAgentsResults(int agentsSurvived, int agentsTerminated)
    {
        Debug.Assert(IsActive);
        Debug.Assert(AgentsSurvived == null);
        Debug.Assert(AgentsTerminated == null);
        AgentsSurvived = agentsSurvived;
        AgentsTerminated = agentsTerminated;
    }
}