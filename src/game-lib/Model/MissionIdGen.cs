using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Model;

public class MissionIdGen : IdGen
{
    public MissionIdGen(List<GameSessionTurn> turns)
    {
        Contract.Assert(turns.Any());
        NextId = turns.Last().EndState.Missions.Count;
    }
}