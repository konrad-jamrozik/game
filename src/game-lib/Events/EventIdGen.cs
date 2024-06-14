using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Events;

public class EventIdGen : IdGen
{
    public EventIdGen(List<GameSessionTurn> turns)
    {
        Contract.Assert(turns.Any());
        // To compute starting next event ID we first need to determine if there are any events in the input
        // game session turns. If yes, we consider as the starting next event ID to be (last event ID + 1).
        // If not, we consider the last turn NextEventId value, if set.
        // Otherwise, we assume no events, meaning NextEventId is equal to zero.
        //
        // Notably we must rely on last turn NextEventId when calling REST API to advance turn
        // from a turn that has no events. This may happen e.g. when advancing from turn 1 to 2
        // when player action made no actions.
        // In such case:
        // - There will be no "before turn" world events, as this is the first turn.
        // - There will be no events in the turn, as the player did nothing.
        // - There will be no "advance turn" event, as the player is advancing turn just right now.
        GameEvent? lastGameEvent = turns.SelectMany(turn => turn.GameEvents).LastOrDefault();
        int? nextEventIdFromLastEvent = lastGameEvent?.Id + 1;
        int? nextEventIdFromLastTurn = turns.Last().NextEventId;
        Contract.Assert(
            nextEventIdFromLastEvent is null || nextEventIdFromLastTurn is null ||
            nextEventIdFromLastEvent == nextEventIdFromLastTurn,
            $"nextEventIdFromLastEvent: {nextEventIdFromLastEvent}, nextEventIdFromLastTurn: {nextEventIdFromLastTurn}");
        NextId = nextEventIdFromLastEvent ?? nextEventIdFromLastTurn ?? 0;
    }
}