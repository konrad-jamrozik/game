namespace UfoGameLib.Model;

public class Agent
{
    public enum State
    {
        InTransit,
        Available,
        OnMission,
        Training, // kja2 Training Currently used, but brings no effect
        GatheringIntel, // kja2 GatheringIntel Currently used, but brings no effect
        GeneratingIncome, // kja2 GeneratingIncome Currently used, but brings no effect
        Recovering, // kja2 Recovering Currently unused
    }

    public static readonly int HireCost = 50;
    public static readonly int UpkeepCost = 5;

    public readonly int Id;
    public State CurrentState;

    public Agent(int id)
    {
        Id = id;
        CurrentState = State.InTransit;
    }

    public bool CanBeSentOnMission => IsAvailable || IsTraining;

    public bool CanBeSentOnMissionNextTurn => CanBeSentOnMission || IsInTransit || IsOnMission;

    public bool IsInTransit => CurrentState == State.InTransit;

    public bool IsAvailable => CurrentState == State.Available;

    public bool IsOnMission => CurrentState == State.OnMission;

    public bool IsTraining => CurrentState == State.Training;

    public bool IsGatheringIntel => CurrentState == State.GatheringIntel;

    public bool IsGeneratingIncome => CurrentState == State.GeneratingIncome;

    public bool IsRecallable => IsGatheringIntel || IsGeneratingIncome;

    public void SendToTraining()
        => CurrentState = State.Training;

    public void GatherIntel()
        => CurrentState = State.GatheringIntel;

    public void GenerateIncome()
        => CurrentState = State.GeneratingIncome;

    public void SendOnMission()
        => CurrentState = State.OnMission;

    public void Recall()
    {
        Debug.Assert(IsRecallable);
        CurrentState = State.InTransit;
    }
}
