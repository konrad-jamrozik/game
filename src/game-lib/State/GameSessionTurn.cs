using System.Text.Json.Serialization;
using Lib.Contracts;
using UfoGameLib.Events;

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

    /// <summary>
    /// ID of the next event to generate. This is required when:
    /// - This is not the first turn in game session, and there was at least one event in previous turns.
    /// - This turn has no events.
    /// - This turn and this turn only is used as a starting point to continue evaluating game session.
    /// Must be ignored if this game session turn has at least one game event in it.
    /// See EventIdGen for more details.
    /// </summary>
    public int? NextEventId;

    [JsonConstructor]
    public GameSessionTurn(
        // Note: at least one param must be mandatory; otherwise JSON deserialization would implicitly call ctor with no args, circumventing validation.
        // Specifically I mean this line in ApiUtils.ParseGameSessionTurn
        // parsedTurn = (requestBody.FromJsonTo<GameSessionTurn>(GameState.StateJsonSerializerOptions));
        GameState startState,  
        List<WorldEvent>? eventsUntilStartState = null,
        List<PlayerActionEvent>? eventsInTurn = null,
        GameState? endState = null,
        PlayerActionEvent? advanceTimeEvent = null,
        int? nextEventId = null)
    {
        EventsUntilStartState = eventsUntilStartState ?? new List<WorldEvent>();
        StartState = startState;
        EventsInTurn = eventsInTurn ?? new List<PlayerActionEvent>();
        EndState = endState ?? StartState.Clone();
        AdvanceTimeEvent = advanceTimeEvent;
        NextEventId = nextEventId ?? 0;

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
            EventsInTurn.Count == EndState.UpdateCount - StartState.UpdateCount,
            "Number of events in turn must match the number of updates between the game states.");

        // kja extract this into "ConsecutiveId" abstraction and invariant.
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

    [JsonIgnore]
    public IReadOnlyList<GameEvent> GameEvents
        => ((List<GameEvent>)
            [
                ..EventsUntilStartState,
                ..EventsInTurn,
                ..(AdvanceTimeEvent != null ? (List<GameEvent>) [AdvanceTimeEvent] : [])
            ])
            .ToList().AsReadOnly();

    public GameSessionTurn Clone()
        => DeepClone();
    
    private GameSessionTurn DeepClone()
        => new(
            StartState.Clone(),
            EventsUntilStartState.Select(gameEvent => gameEvent.Clone()).ToList(),
            EventsInTurn.Select(gameEvent => gameEvent.Clone()).ToList(),
            EndState.Clone(),
            AdvanceTimeEvent?.Clone(),
            NextEventId
        );
}
