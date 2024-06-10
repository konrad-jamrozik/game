using UfoGameLib.State;

namespace UfoGameLib.Events;

public class EventIdGen
{
    private int _nextEventId;

    public EventIdGen(List<GameSessionTurn> turns)
    {
        // To compute starting next event ID we first need to determine if there are any events in the input
        // game session turns. If yes, we consider as the starting next event ID to be (last event ID + 1).
        // If not, we consider the last turn NextEventId value, if set.
        // Otherwise, we assume no offset, meaning it is equal to zero.
        //
        // Notably we must rely on last turn NextEventId when calling REST API to advance turn
        // from a turn that has no events. This may happen e.g. when advancing from turn 1 to 2
        // when player action made no actions.
        // In such case:
        // - There will be no "before turn" world events, as this is the first turn.
        // - There will be no events in the turn, as the player did nothing.
        // - There will be no "advance turn" event, as the player is advancing turn just right now.
        GameEvent? lastGameEvent = turns.SelectMany(turn => turn.GameEvents).LastOrDefault();
        _nextEventId = lastGameEvent != null ? lastGameEvent.Id + 1 : turns.Last().NextEventId ?? 0;
    }
    
    public int Generate => _nextEventId++;
    public int Value => _nextEventId;
}