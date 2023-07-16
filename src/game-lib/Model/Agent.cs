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
        Recovering, // kja2 Recovering Currently unused
        Terminated
    }

    public static readonly int HireCost = 50;
    public static readonly int UpkeepCost = 5;

    public readonly int Id;
    public State CurrentState;
    public Mission? CurrentMission;
    public int TurnsTrained;

    public Agent(int id)
    {
        Id = id;
        CurrentState = State.InTransit;
        TurnsTrained = 0;
    }

    [JsonConstructor]
    public Agent(int id, State currentState, Mission? currentMission, int turnsTrained)
    {
        Id = id;
        CurrentState = currentState;
        CurrentMission = currentMission;
        TurnsTrained = turnsTrained;
        AssertMissionInvariant();
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
    public bool IsRecovering => CurrentState == State.Recovering;
    
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
    public bool CanBeSentOnMissionNextTurn => CanBeSentOnMission || IsArrivingNextTurn;


    // Here we assume that if agent:
    // IsInTransit, they will arrive next turn.
    // IsOnMission, they will return to base next turn, combat ready.
    // kja2 this is now no longer strictly correct, as IsOnMission may result in IsTerminated
    [JsonIgnore] 
    public bool IsArrivingNextTurn => IsInTransit || IsOnMission;

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
        CurrentState = State.Training;
    }

    public void GatherIntel()
    {
        Debug.Assert(CanBeSentOnMission);
        CurrentState = State.GatheringIntel;
    }

    public void GenerateIncome()
    {
        Debug.Assert(CanBeSentOnMission);
        CurrentState = State.GeneratingIncome;
    }

    public void SendOnMission(Mission mission)
    {
        Debug.Assert(CanBeSentOnMission);
        CurrentState = State.OnMission;
        CurrentMission = mission;
        AssertMissionInvariant();
    }

    public void MakeAvailable()
    {
        Debug.Assert(!IsAvailable);
        if (IsOnMission)
            CurrentMission = null;
        CurrentState = State.Available;
        AssertMissionInvariant();
    }

    public void Recall()
    {
        Debug.Assert(IsRecallable);
        CurrentState = State.InTransit;
    }

    public void Terminate(bool sack = false)
    {
        Debug.Assert(IsAlive);
        Debug.Assert(sack ? CanBeSacked : IsOnMission);
        CurrentState = State.Terminated;
        CurrentMission = null;
        AssertMissionInvariant();
    }

    private void AssertMissionInvariant()
    {
        Debug.Assert(
            IsOnMission == (CurrentMission != null),
            $"IsOnMission: {IsOnMission} == (CurrentMission != null): {CurrentMission != null}");
    }
}
