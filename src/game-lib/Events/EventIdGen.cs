using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Events;

public class EventIdGen : IdGen
{
    public EventIdGen(List<GameSessionTurn> turns)
    {
        (int? idFromLastEvent, int? isFromLastTurn) = AssertInvariants(turns);
        NextId = idFromLastEvent ?? isFromLastTurn ?? 0;
    }

    public (int? idFromLastEvent, int? isFromLastTurn) AssertInvariants(List<GameSessionTurn> turns)
    {
        Contract.Assert(turns.Any());
        (int? idFromLastEvent, int? isFromLastTurn) = NextEventIdFromLastEvent(turns);
        Contract.Assert(
            idFromLastEvent is null || isFromLastTurn is null ||
            idFromLastEvent == isFromLastTurn,
            $"nextEventIdFromLastEvent: {idFromLastEvent}, nextEventIdFromLastTurn: {isFromLastTurn}");
        return (idFromLastEvent, isFromLastTurn);
    }

    private static (int? idFromLastEvent, int? isFromLastTurn) NextEventIdFromLastEvent(
        List<GameSessionTurn> turns)
    {
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
        // ReSharper disable once MergeConditionalExpression
        // Disabled because it is not equivalent. Currently null will return null but after merging null would return 1.
        int? idFromLastEvent = lastGameEvent != null ? lastGameEvent.Id + 1 : null;
        int? isFromLastTurn = turns.Last().NextEventId;
        return (idFromLastEvent, isFromLastTurn);
    }
}
