using System.Text.Json.Serialization;
using Lib.Contracts;
using Lib.Json;

namespace UfoGameLib.Model;

public class Agent : IIdentifiable
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

    public int Id { get; }

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
        Contract.Assert(TurnHired >= 1);
        Contract.Assert(TurnTerminated == null || TurnHired <= TurnTerminated);
        AssertInvariants();
        Contract.Assert(!sacked || turnTerminated != null);
        Contract.Assert(!IsRecovering || RecoversIn >= 1);
        Contract.Assert(IsRecovering || RecoversIn == null);
    }

    [JsonIgnore]
    public int SurvivalSkill => Ruleset.AgentsRuleset.AgentSurvivalSkill(this);

    public int SurvivalChance(int difficulty) => AgentSurvivalRoll.ComputeSurvivalChance(this, difficulty);

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
    public bool CanBeSentToTraining => CanBeSentOnMission && !IsTraining;

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
    public bool CanBeRecalled => IsDoingOps;

    [JsonIgnore]
    public bool IsAway => IsInTransit || IsDoingOps || IsOnMission;

    [JsonIgnore]
    public bool IsAlive => /* (IsInBase || IsAway) && */ !IsTerminated;

    public void SendToTraining()
    {
        Contract.Assert(CanBeSentToTraining);
        CurrentState = AgentState.Training;
    }

    public void GatherIntel()
    {
        Contract.Assert(CanBeSentOnMission);
        Contract.Assert(!IsGatheringIntel);
        CurrentState = AgentState.GatheringIntel;
    }

    public void GenerateIncome()
    {
        Contract.Assert(CanBeSentOnMission);
        Contract.Assert(!IsGeneratingIncome);
        CurrentState = AgentState.GeneratingIncome;
    }

    public void SendOnMission(Mission mission)
    {
        Contract.Assert(CanBeSentOnMission);
        Contract.Assert(!IsOnMission);
        CurrentState = AgentState.OnMission;
        CurrentMission = mission;
        // Note:
        // We are not increasing MissionsLaunched here
        // as it would screw up various computations,
        // like e.g. computation of the agent skill during the mission
        // would already take into the account experience from that mission
        // itself, but shouldn't.
        // Instead, we increment this when we finish evaluating a mission
        // and also increment either the count of successful or failed 
        // missions.
        AssertInvariants();
    }

    public void FinishMissionUnharmed()
    {
        Contract.Assert(IsOnMission);
        CurrentMission = null;
        CurrentState = AgentState.Available;
        AssertInvariants();
    }

    public void FinishRecovery()
    {
        Contract.Assert(IsRecovering);
        Contract.Assert(RecoversIn == 0);
        RecoversIn = null;
        CurrentState = AgentState.Available;
        AssertInvariants();
    }

    public void FinishTransfer()
    {
        Contract.Assert(IsInTransit);
        CurrentState = AgentState.Available;
        AssertInvariants();
    }

    public void FinishMissionWithWounds(int? recoversIn)
    {
        Contract.Assert(recoversIn >= 1);
        Contract.Assert(IsOnMission);
        
        CurrentState = AgentState.Recovering;
        CurrentMission = null;
        RecoversIn = recoversIn;

        AssertInvariants();
    }

    public void TickRecovery()
    {
        Contract.Assert(IsRecovering);
        Contract.Assert(RecoversIn >=1 );

        RecoversIn--;
        TurnsInRecovery++;

        if (RecoversIn == 0)
        {
            FinishRecovery();
        }
    }

    public void Recall()
    {
        Contract.Assert(CanBeRecalled);
        CurrentState = AgentState.InTransit;
    }

    public void Terminate(int turnTerminated, bool sack = false)
    {
        Contract.Assert(IsAlive);
        Contract.Assert(sack ? CanBeSacked : IsOnMission);
        Contract.Assert(turnTerminated >= TurnHired);
        CurrentState = AgentState.Terminated;
        TurnTerminated = turnTerminated;
        CurrentMission = null;
        Sacked = sack;
        AssertInvariants();
    }

    [JsonIgnore]
    public string LogString => $"AgentID: {Id,4}";

    public int TurnsSurvived(int currentTurn)
    {
        int agentEndTurn = TurnTerminated ?? currentTurn;
        int turnsSurvived = agentEndTurn - TurnHired;
        return turnsSurvived;
    }

    private void AssertInvariants()
    {
        Contract.Assert(
            IsOnMission == (CurrentMission != null),
            $"IsOnMission: {IsOnMission} == (CurrentMission != null): {CurrentMission != null}");

        Contract.Assert(MissionsSurvived >= 0);
        Contract.Assert(MissionsSucceeded >= 0);
        Contract.Assert(MissionsFailed >= 0);
        // If agent didn't survive their last mission, its outcome still counts towards their
        // missions succeeded or failed, that's why this comparison allows the difference of 1.
        Contract.Assert(MissionsSucceeded + MissionsFailed >= MissionsSurvived);
        Contract.Assert(MissionsSucceeded + MissionsFailed <= MissionsSurvived + 1);
        
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
