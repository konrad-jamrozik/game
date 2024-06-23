using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Events;

public class EventIdGen : IdGen
{
    public EventIdGen(List<GameSessionTurn> turns)
    {
        GameEvent lastGameEvent = turns.SelectMany(turn => turn.GameEvents).Last();
        int idFromLastEvent = lastGameEvent.Id + 1;
        NextId = idFromLastEvent;
    }
}
