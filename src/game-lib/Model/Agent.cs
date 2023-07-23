using System.Text.Json.Serialization;

namespace UfoGameLib.Model;

public class Agent
{
    public enum State
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
    public State CurrentState;
    public Mission? CurrentMission;
    public int RecoversIn;

    public readonly int TurnHired;
    public int? TurnTerminated;

    public int MissionsLaunched;
    public int MissionsSucceeded;
    public int MissionsFailed;

    public int TurnsInTraining;
    public int TurnsGeneratingIncome;
    public int TurnsGatheringIntel;
    public int TurnsInRecovery;

    // ReSharper disable once IntroduceOptionalParameters.Global
    public Agent(int id, int turnHired) : this(
        id,
        State.InTransit,
        currentMission: null,
        recoversIn: 0,
        turnHired: turnHired,
        turnTerminated: null,
        missionsLaunched: 0,
        missionsSucceeded: 0,
        missionsFailed: 0,
        turnsInTraining: 0,
        turnsGeneratingIncome: 0,
        turnsGatheringIntel: 0,
        turnsInRecovery: 0)
    {
    }

    [JsonConstructor]
    public Agent(
        int id,
        State currentState,
        Mission? currentMission,
        int recoversIn,
        int turnHired,
        int? turnTerminated,
        int missionsLaunched,
        int missionsSucceeded,
        int missionsFailed,
        int turnsInTraining,
        int turnsGeneratingIncome,
        int turnsGatheringIntel,
        int turnsInRecovery)
    {
        Id = id;
        CurrentState = currentState;
        CurrentMission = currentMission;
        TurnsInTraining = turnsInTraining;
        RecoversIn = recoversIn;
        TurnHired = turnHired;
        TurnTerminated = turnTerminated;
        MissionsLaunched = missionsLaunched;
        MissionsSucceeded = missionsSucceeded;
        MissionsFailed = missionsFailed;
        TurnsGeneratingIncome = turnsGeneratingIncome;
        TurnsGatheringIntel = turnsGatheringIntel;
        TurnsInRecovery = turnsInRecovery;
        Debug.Assert(TurnHired >= 1);
        Debug.Assert(TurnTerminated == null || TurnHired <= TurnTerminated);
        AssertMissionInvariants();
    }

    [JsonIgnore]
    public bool IsAvailable => CurrentState == State.Available;

    [JsonIgnore]
    public bool IsOnMission => CurrentState == State.OnMission;

    [JsonIgnore]
    public bool IsTraining => CurrentState == State.Training;

    [JsonIgnore]
    public bool IsGatheringIntel => CurrentState == State.GatheringIntel;

    [JsonIgnore]
    public bool IsGeneratingIncome => CurrentState == State.GeneratingIncome;

    [JsonIgnore]
    public bool IsRecovering
    {
        get
        {
            bool isRecovering = CurrentState == State.Recovering;
            Debug.Assert(!isRecovering || RecoversIn > 0);
            return isRecovering;
        }
    }

    [JsonIgnore]
    public bool IsInTransit => CurrentState == State.InTransit;

    [JsonIgnore]
    public bool IsTerminated => CurrentState == State.Terminated;

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
    public bool IsAlive => (IsInBase || IsAway) && !IsTerminated;

    public void SendToTraining()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsTraining);
        CurrentState = State.Training;
    }

    public void GatherIntel()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsGatheringIntel);
        CurrentState = State.GatheringIntel;
    }

    public void GenerateIncome()
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsGeneratingIncome);
        CurrentState = State.GeneratingIncome;
    }

    public void SendOnMission(Mission mission)
    {
        Debug.Assert(CanBeSentOnMission);
        Debug.Assert(!IsOnMission);
        CurrentState = State.OnMission;
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
        CurrentState = State.Available;
        AssertMissionInvariants();
    }

    public void SetRecoversIn(int recoversIn)
    {
        Debug.Assert(recoversIn > 0);
        
        if (IsOnMission)
            CurrentMission = null;

        CurrentState = State.Recovering;
        RecoversIn = recoversIn;

        AssertMissionInvariants();
    }

    public void TickRecovery()
    {
        Debug.Assert(IsRecovering);
        Debug.Assert(RecoversIn > 0);

        RecoversIn--;
        TurnsInRecovery++;

        if (RecoversIn == 0)
            MakeAvailable();
    }

    public void Recall()
    {
        Debug.Assert(IsRecallable);
        CurrentState = State.InTransit;
    }

    public void Terminate(int turnTerminated, bool sack = false)
    {
        Debug.Assert(IsAlive);
        Debug.Assert(!IsTerminated);
        Debug.Assert(sack ? CanBeSacked : IsOnMission);
        Debug.Assert(turnTerminated >= TurnHired);
        CurrentState = State.Terminated;
        TurnTerminated = turnTerminated;
        CurrentMission = null;
        AssertMissionInvariants();
    }

    [JsonIgnore]
    public string LogString => $"AgentID: {Id,4}";

    private void AssertMissionInvariants()
    {
        Debug.Assert(
            IsOnMission == (CurrentMission != null),
            $"IsOnMission: {IsOnMission} == (CurrentMission != null): {CurrentMission != null}");
        
        Debug.Assert(MissionsLaunched >= 0);
        Debug.Assert(MissionsSucceeded >= 0);
        Debug.Assert(MissionsFailed >= 0);
        Debug.Assert(MissionsLaunched == MissionsSucceeded + MissionsFailed);
    }
}
