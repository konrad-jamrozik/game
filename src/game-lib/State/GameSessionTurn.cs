using System.Text.Json.Serialization;
using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;

namespace UfoGameLib.State;

public class GameSessionTurn
{
    // Future work: implement custom deserialization converter to handle deserializing derived WorldEvents
    // See https://chatgpt.com/c/ef2aadcc-7e9d-491f-b7b6-7f8011c69676
    public readonly List<WorldEvent> EventsUntilStartState;
    public readonly GameState StartState;
    
    public readonly List<PlayerActionEvent> EventsInTurn;
    public readonly GameState EndState;

    public PlayerActionEvent? AdvanceTimeEvent;

    [JsonConstructor]
    public GameSessionTurn(
        // Note: at least one param must be mandatory; see docs/serialization.md for details.
        GameState startState,  
        List<WorldEvent>? eventsUntilStartState = null,
        List<PlayerActionEvent>? eventsInTurn = null,
        GameState? endState = null,
        PlayerActionEvent? advanceTimeEvent = null)
    {
        EventsUntilStartState = eventsUntilStartState ?? [new WorldEvent(0, GameEventName.ReportEvent, [0, 0])];
        StartState = startState;
        EventsInTurn = eventsInTurn ?? new List<PlayerActionEvent>();
        EndState = endState ?? StartState.Clone();
        AdvanceTimeEvent = advanceTimeEvent;

        AssertInvariants();
    }

    public void AssertInvariants()
    {
        Contract.Assert(
            StartState.Timeline.CurrentTurn == EndState.Timeline.CurrentTurn,
            $"Both game states in the turn must denote the same turn. " +
            $"StartState turn: {StartState.Timeline.CurrentTurn}, EndState turn: {EndState.Timeline.CurrentTurn}");

        Contract.Assert(
            EndState.UpdateCount >= StartState.UpdateCount,
            "End state must have same or more updates than start state.");

        Contract.Assert(
            EventsInTurn.Count == EndState.UpdateCount - StartState.UpdateCount,
            "Number of events in turn must match the number of updates between the game states.");

        Contract.Assert(EventsUntilStartState.Last().Type == GameEventName.ReportEvent);
        IdGen.AssertConsecutiveIds(GameEvents.ToList());
        StartState.AssertInvariants();
        EndState.AssertInvariants();
    }

    [JsonIgnore]
    public IReadOnlyList<GameEvent> GameEvents
        => ((List<GameEvent>)
            [
                ..EventsUntilStartState,
                ..EventsInTurn,
                ..(AdvanceTimeEvent != null ? (List<GameEvent>) [AdvanceTimeEvent] : [])
            ]).AsReadOnly();

    [JsonIgnore]
    public IReadOnlyList<GameState> GameStates
        => ((List<GameState>)[StartState, EndState]).AsReadOnly();

    public GameSessionTurn Clone()
        => DeepClone();
    
    private GameSessionTurn DeepClone()
        => new(
            StartState.Clone(),
            EventsUntilStartState.Select(gameEvent => gameEvent.Clone()).ToList(),
            EventsInTurn.Select(gameEvent => gameEvent.Clone()).ToList(),
            EndState.Clone(),
            AdvanceTimeEvent?.Clone()
        );
}
