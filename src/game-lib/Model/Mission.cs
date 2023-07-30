using System.Text.Json.Serialization;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public enum MissionState
    {
        Active,
        Successful,
        Failed
    }

    public readonly int AgentsSent;

    public MissionSite Site;
    public MissionState CurrentState;

    public Mission(int id, MissionSite site, int turn, int agentsSent) : this(
        id, 
        site,
        agentsSent)
    {
        Debug.Assert(site.IsActive);
        site.LaunchMission(turn);
    }

    [JsonConstructor]
    public Mission(
        int id,
        MissionSite site,
        int agentsSent,
        MissionState currentState = MissionState.Active,
        int? agentsSurvived = null,
        int? agentsTerminated = null)
    {
        Id = id;
        Site = site;
        CurrentState = currentState;
        AgentsSent = agentsSent;
        AgentsSurvived = agentsSurvived;
        AgentsTerminated = agentsTerminated;
        Debug.Assert(
            (IsActive && AgentsSurvived == null && AgentsTerminated == null)
            || (!IsActive && AgentsSurvived >= 0 && AgentsTerminated >= 0
                && (AgentsSent == AgentsSurvived + AgentsTerminated)));
    }

    public int? AgentsSurvived { get; private set; }
    public int? AgentsTerminated { get; private set; }

    [JsonIgnore]
    public bool IsActive => CurrentState == MissionState.Active;

    [JsonIgnore]
    public bool IsSuccessful => CurrentState == MissionState.Successful;

    [JsonIgnore]
    public bool IsFailed => CurrentState == MissionState.Failed;

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