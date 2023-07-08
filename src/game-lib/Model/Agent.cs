namespace UfoGameLib.Model;

public class Agent
{
    public readonly int Id;
    // kja Agent.CurrentState: bunch of todos:
    // - ensure save/load works with this
    // - Ensure that nothing can be done with InTransit agents
    // - See to-do in LaunchMissionPlayerAction for OnMission state
    //   - Now the mission result needs to be computed at the end of turn, not immediately
    public State CurrentState;

    public enum State
    {
        InTransit,
        Available,
        OnMission,
        Training, // Currently unused
        Recovering, // Currently unused
        GatheringIntel, // Currently unused
        GeneratingIncome // Currently unused
    }

    public Agent(int id)
    {
        Id = id;
        CurrentState = State.InTransit;
    }

    public bool CanBeSentOnMission => CurrentState == State.Available;
}
