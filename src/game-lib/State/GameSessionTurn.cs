using Lib.Contracts;
using UfoGameLib.Controller;
using UfoGameLib.Events;

namespace UfoGameLib.State;

public class GameSessionTurn
{
    public readonly List<WorldEvent> EventsUntilStartState;
    public readonly GameState StartState;
    
    public readonly List<PlayerActionEvent> EventsInTurn;
    public readonly GameState EndState;

    public PlayerActionEvent? AdvanceTimeEvent;

    public GameSessionTurn(
        List<WorldEvent>? eventsUntilStartState = null,
        GameState? startState = null,
        List<PlayerActionEvent>? eventsInTurn = null,
        GameState? endState = null,
        PlayerActionEvent? advanceTimeEvent = null)
    {
        EventsUntilStartState = eventsUntilStartState ?? new List<WorldEvent>();
        StartState = startState ?? GameState.NewInitialGameState();
        EventsInTurn = eventsInTurn ?? new List<PlayerActionEvent>();
        EndState = endState ?? StartState.Clone();
        AdvanceTimeEvent = advanceTimeEvent;

        AssertInvariants();
    }

    private void AssertInvariants()
    {
        Contract.Assert(
            StartState.Timeline.CurrentTurn == EndState.Timeline.CurrentTurn,
            "Both game states in the turn must denote the same turn.");

        Contract.Assert(
            EndState.UpdateCount >= StartState.UpdateCount,
            "End state must have same or more updates than start state.");

        Contract.Assert(
            EventsInTurn.All(
                gameEvent => gameEvent.Type != nameof(AdvanceTimePlayerAction)),
            "All events in turn must be player actions and none of them can be time advancement.");

        if (AdvanceTimeEvent != null)
        {
            Contract.Assert(
                AdvanceTimeEvent.Type == nameof(AdvanceTimePlayerAction),
                "AdvanceTimeEvent must be of type AdvanceTimePlayerAction.");
        }

        Contract.Assert(
            EventsInTurn.Count == EndState.UpdateCount - StartState.UpdateCount,
            "Number of events in turn must match the number of updates between the game states.");
    }

    public GameSessionTurn Clone()
        => DeepClone();
    
    private GameSessionTurn DeepClone()
        => new(
            EventsUntilStartState.Select(gameEvent => gameEvent.Clone()).ToList(),
            StartState.Clone(),
            EventsInTurn.Select(gameEvent => gameEvent.Clone()).ToList(),
            EndState.Clone(),
            AdvanceTimeEvent?.Clone()
        );
}