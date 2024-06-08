using Lib.Contracts;
using UfoGameLib.Controller;
using UfoGameLib.Events;

namespace UfoGameLib.State;

public class GameSessionTurn
{
    public readonly List<GameEvent> EventsUntilStartState;
    public readonly GameState StartState;
    
    public readonly List<GameEvent> EventsInTurn;
    public readonly GameState EndState;

    public GameSessionTurn(
        List<GameEvent>? eventsUntilStartState = null,
        GameState? startState = null,
        List<GameEvent>? eventsInTurn = null,
        GameState? endState = null)
    {
        EventsUntilStartState = eventsUntilStartState ?? new List<GameEvent>();
        StartState = startState ?? GameState.NewInitialGameState();
        EventsInTurn = eventsInTurn ?? new List<GameEvent>();
        EndState = endState ?? StartState.Clone();

        AssertInvariants();
    }

    private void AssertInvariants()
    {
        if (EventsUntilStartState.Any())
        {
            // kja instead, the AdvanceTimePlayerAction should be the last event, after endstate. This way turn number will be correct.
            Contract.Assert(
                EventsUntilStartState.First().Type == nameof(AdvanceTimePlayerAction),
                "If there are any events leading up to the start game state, the first one must be the Advance Time player action.");

            Contract.Assert(
                EventsUntilStartState.Skip(1).All(gameEvent => gameEvent is WorldEvent),
                "If there are any events leading up to the start game state, all of them except the first one must be world events.");
        }

        Contract.Assert(
            StartState.Timeline.CurrentTurn == EndState.Timeline.CurrentTurn,
            "Both game states in the turn must denote the same turn.");

        Contract.Assert(
            EndState.UpdateCount >= StartState.UpdateCount,
            "End state must have same or more updates than start state.");

        Contract.Assert(
            EventsInTurn.All(
                gameEvent => gameEvent is PlayerActionEvent && gameEvent.Type != nameof(AdvanceTimePlayerAction)),
            "All events in turn must be player actions and none of them can be time advancement.");
    }

    public GameSessionTurn Clone()
        => DeepClone();
    
    private GameSessionTurn DeepClone()
        => new(
            EventsUntilStartState.Select(gameEvent => gameEvent.Clone()).ToList(),
            StartState.Clone(),
            EventsInTurn.Select(gameEvent => gameEvent.Clone()).ToList(),
            EndState.Clone()
        );
}