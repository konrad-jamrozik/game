using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

// kja2 should this implement IIdentifiable the same as MissionSite?
// I think currently it doesn't because Agents are never serialized by reference
// by GameStateJsonConverter, so it doesn't matter if they implement IIdentifiable
public class Agent
{
    public enum AgentState
    {
        InTransit,
        Available,
        OnMission,
        Training,
        GatheringIntel,
        GeneratingIncome,
        Recovering,
        Terminated
    }

    public readonly int Id;

    public readonly int TurnHired;
    public AgentState CurrentState;
    public Mission? CurrentMission;
    public int? RecoversIn;
    public int? TurnTerminated;
    public bool Sacked;

    public int MissionsSurvived;
    public int MissionsSucceeded;
    public int MissionsFailed;

    public int TurnsInTraining;
    public int TurnsGeneratingIncome;
    public int TurnsGatheringIntel;
    public int TurnsInRecovery;

    [JsonConstructor]
    public Agent(
        int id,
        int turnHired,
        AgentState currentState = AgentState.InTransit,
        Mission? currentMission = null,
        int? recoversIn = null,
        int? turnTerminated = null,
        bool sacked = false,
        int missionsSurvived = 0,
        int missionsSucceeded = 0,
        int missionsFailed = 0,
        int turnsInTraining = 0,
        int turnsGeneratingIncome = 0,
        int turnsGatheringIntel = 0,
        int turnsInRecovery = 0)
    {
        Id = id;
        CurrentState = currentState;
        CurrentMission = currentMission;
        TurnsInTraining = turnsInTraining;
        RecoversIn = recoversIn;
        TurnHired = turnHired;
        TurnTerminated = turnTerminated;
        Sacked = sacked;
        MissionsSurvived = missionsSurvived;
        MissionsSucceeded = missionsSucceeded;
        MissionsFailed = missionsFailed;
        TurnsGeneratingIncome = turnsGeneratingIncome;
        TurnsGatheringIntel = turnsGatheringIntel;
        TurnsInRecovery = turnsInRecovery;
        Debug.Assert(TurnHired >= 1);
        Debug.Assert(TurnTerminated == null || TurnHired <= TurnTerminated);
        AssertMissionInvariants();
        Debug.Assert(!sacked || turnTerminated != null);
        Debug.Assert(!IsRecovering || RecoversIn >= 1);
        Debug.Assert(IsRecovering || RecoversIn == null);
    }

    [JsonIgnore]
    public int SurvivalSkill => Ruleset.AgentSurvivalSkill(this);

    public int SurvivalChance(int difficulty) => Ruleset.AgentSurvivalChance(this, difficulty);

    [JsonIgnore]
    public int TurnsInOps => TurnsGeneratingIncome + TurnsGatheringIntel;

    [JsonIgnore]
    public bool IsAvailable => CurrentState == AgentState.Available;

    [JsonIgnore]
    public bool IsOnMission => CurrentState == AgentState.OnMission;

    [JsonIgnore]
    public bool IsTraining => CurrentState == AgentState.Training;

    [JsonIgnore]
    public bool IsGatheringIntel => CurrentState == AgentState.GatheringIntel;

    [JsonIgnore]
    public bool IsGeneratingIncome => CurrentState == AgentState.GeneratingIncome;

    [JsonIgnore]
    public bool IsRecovering => CurrentState == AgentState.Recovering;

    [JsonIgnore]
    public bool IsInTransit => CurrentState == AgentState.InTransit;

    [JsonIgnore]
    public bool IsTerminated => CurrentState == AgentState.Terminated;

    [JsonIgnore]
    public bool CanBeSentOnMission => IsAvailable || IsTraining;

    [JsonIgnore]
    public bool CanBeSacked => IsAvailable || IsTraining;

    [JsonIgnore]
    public bool IsInBase => IsAvailable || IsTraining || IsRecovering;

    [JsonIgnore] 
    public bool CanBeSentOnMissionNextTurnForSure => CanBeSentOnMission || IsArrivingNextTurnForSure;

    [JsonIgnore] 
    public bool CanBeSentOnMissionNextTurnMaybe => CanBeSentOnMission || IsArrivingNextTurnMaybe;

    [JsonIgnore]
    public bool IsArrivingNextTurnForSure => IsInTransit;

    [JsonIgnore]
    public bool IsArrivingNextTurnMaybe => IsArrivingNextTurnForSure || IsOnMission;

    [JsonIgnore]
    public bool IsDoingOps => IsGatheringIntel || IsGeneratingIncome;

    [JsonIgnore]
    public bool IsRecallable => IsDoingOps;

    [JsonIgnore]
    public bool IsAway => IsInTransit || IsDoingOps || IsOnMission;

    [JsonIgnore]
    public bool IsAlive => /* (IsInBase || IsAway) && */ !IsTerminated;

    public void SendToTraining()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsTraining);
        CurrentState = AgentState.Training;
    }

    public void GatherIntel()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsGatheringIntel);
        CurrentState = AgentState.GatheringIntel;
    }

    public void GenerateIncome()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsGeneratingIncome);
        CurrentState = AgentState.GeneratingIncome;
    }

    public void SendOnMission(Mission mission)
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsOnMission);
        CurrentState = AgentState.OnMission;
        CurrentMission = mission;
        // Note:
        // We are not increasing MissionsLaunched here
        // as it would screw up various computations,
        // like e.g. computation of the agent skill during the mission
        // would already take into the account experience from that mission
        // itself, but shouldn't.
        // Instead, we increment this when we finish evaluating a mission
        // and also increment either the count of successful or of failed 
        // missions.
        AssertMissionInvariants();
    }

    public void MakeAvailable()
    {
        Debug.Assert(!IsAvailable);
        if (IsOnMission)
            CurrentMission = null;
        CurrentState = AgentState.Available;
        AssertMissionInvariants();
    }

    public void SetRecoversIn(int recoversIn)
    {
        Debug.Assert(recoversIn >= 1);
        
        if (IsOnMission)
            CurrentMission = null;

        CurrentState = AgentState.Recovering;
        RecoversIn = recoversIn;

        AssertMissionInvariants();
    }

    public void TickRecovery()
    {
        Debug.Assert(IsRecovering);
        Debug.Assert(RecoversIn >=1 );

        RecoversIn--;
        TurnsInRecovery++;

        if (RecoversIn == 0)
        {
            RecoversIn = null;
            MakeAvailable();
        }
    }

    public void Recall()
    {
        Debug.Assert(IsRecallable);
        CurrentState = AgentState.InTransit;
    }

    public void Terminate(int turnTerminated, bool sack = false)
    {
        Debug.Assert(IsAlive);
        Debug.Assert(sack ? CanBeSacked : IsOnMission);
        Debug.Assert(turnTerminated >= TurnHired);
        CurrentState = AgentState.Terminated;
        TurnTerminated = turnTerminated;
        CurrentMission = null;
        Sacked = sack;
        AssertMissionInvariants();
    }

    [JsonIgnore]
    public string LogString => $"AgentID: {Id,4}";

    public int TurnsSurvived(int currentTurn)
    {
        int agentEndTurn = TurnTerminated ?? currentTurn;
        int turnsSurvived = agentEndTurn - TurnHired;
        return turnsSurvived;
    }

    private void AssertMissionInvariants()
    {
        Debug.Assert(
            IsOnMission == (CurrentMission != null),
            $"IsOnMission: {IsOnMission} == (CurrentMission != null): {CurrentMission != null}");
        
        Debug.Assert(MissionsSurvived >= 0);
        Debug.Assert(MissionsSucceeded >= 0);
        Debug.Assert(MissionsFailed >= 0);
        // If agent didn't survive their last mission, its outcome still counts towards their
        // missions succeeded or failed, that's why this comparison allows the difference of 1.
        Debug.Assert(MissionsSucceeded + MissionsFailed >= MissionsSurvived);
        Debug.Assert(MissionsSucceeded + MissionsFailed <= MissionsSurvived + 1);
        // kja2 add invariant that terminated agent is not on a mission
    }

    public Agent DeepClone(Mission? clonedMission)
    {
        return new Agent(
            Id,
            TurnHired,
            CurrentState,
            clonedMission,
            RecoversIn,
            TurnTerminated,
            Sacked,
            MissionsSurvived,
            MissionsSucceeded,
            MissionsFailed,
            TurnsInTraining,
            TurnsGeneratingIncome,
            TurnsGatheringIntel,
            TurnsInRecovery);
    }
}
