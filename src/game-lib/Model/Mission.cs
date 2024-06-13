using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Model;

public class Mission : IIdentifiable
{
    public int Id { get; }

    public enum MissionState
    {
        Active,
        Successful,
        Failed
    }

    public readonly int AgentsSent;

    public MissionState CurrentState;

    public MissionSite Site;

    public int? AgentsSurvived { get; private set; }
    public int? AgentsTerminated { get; private set; }

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
        Contract.Assert(
            (IsActive && AgentsSurvived == null && AgentsTerminated == null)
            || (!IsActive && AgentsSurvived >= 0 && AgentsTerminated >= 0
                && (AgentsSent == AgentsSurvived + AgentsTerminated)));
    }

    public Mission(int id, MissionSite site, int turn, int agentsSent) : this(
        id, 
        site,
        agentsSent)
    {
        Contract.Assert(site.IsActive);
        site.LaunchMission(turn);
    }

    [JsonIgnore]
    public bool IsActive => CurrentState == MissionState.Active;

    [JsonIgnore]
    public bool IsSuccessful => CurrentState == MissionState.Successful;

    [JsonIgnore]
    public bool IsFailed => CurrentState == MissionState.Failed;

    [JsonIgnore]
    public bool WasLaunched => IsSuccessful || IsFailed;

    [JsonIgnore]
    public string LogString => $"MissionID: {Id,3}";

    public void ApplyAgentsResults(int agentsSurvived, int agentsTerminated)
    {
        Contract.Assert(IsActive);
        Contract.Assert(AgentsSurvived == null);
        Contract.Assert(AgentsTerminated == null);
        AgentsSurvived = agentsSurvived;
        AgentsTerminated = agentsTerminated;
    }

    public Mission DeepClone(MissionSite clonedMissionSite)
    {
        return new Mission(
            id: Id,
            site: clonedMissionSite,
            agentsSent: AgentsSent,
            currentState: CurrentState,
            agentsSurvived: AgentsSurvived,
            agentsTerminated: AgentsTerminated);
    }
}