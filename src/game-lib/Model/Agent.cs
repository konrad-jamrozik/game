namespace UfoGameLib.Model;

public class Agent
{
    public static readonly int HireCost = 50;
    public static readonly int UpkeepCost = 5;

    public readonly int Id;
    public State CurrentState;

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

    public Agent(int id)
    {
        Id = id;
        CurrentState = State.InTransit;
    }

    public bool CanBeSentOnMission => CurrentState == State.Available || CurrentState == State.Training;

    public bool IsAvailable => CurrentState == State.Available;

    public void SendToTraining()
        => CurrentState = State.Training;

    public void GatherIntel()
        => CurrentState = State.GatheringIntel;

    public void GenerateIncome()
        => CurrentState = State.GeneratingIncome;
}
