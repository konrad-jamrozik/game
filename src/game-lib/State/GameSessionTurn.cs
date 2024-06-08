using Lib.Contracts;
using Lib.Primitives;
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

    // kja two problems:
    // 1. when turn is advanced, two GameSessionTurn instances need to change:
    // - the one *from* which turn is advanced: the advanceTimeEvent must be set
    // - the one *into* which turn is advanced.
    // This is an issue from frontend point of view. When user clicks "advance turn"
    // and passes as input the current turn game state, the backend needs to return not only the new
    //  gameSessionTurn, but also the advanceTurn player event.
    // 2. Next event ID is not stored in game state; it is stored in GameSession,
    // which is ephemerally created upon each API call to backend, so frontend needs to pass this value.
    // This is not a problem with other IDs as they are stored within game states which are always passed.
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

    public void AssertInvariants()
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

        IReadOnlyList<GameEvent> events = GameEvents;
        if (events.Any())
        {
            int firstId = events[0].Id;
            for (int i = 0; i < events.Count; i++)
            {
                int expectedId = firstId + i;
                Contract.Assert(
                    events[i].Id == expectedId,
                    $"Event id {events[i].Id} is not equal to expected {expectedId}.");
            }
        }
    }

    public IReadOnlyList<GameEvent> GameEvents 
        => ((List<GameEvent>) [..EventsUntilStartState, ..EventsInTurn])
        .Concat((AdvanceTimeEvent as GameEvent)?.WrapInList() ?? [])
        .ToList().AsReadOnly();

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