using Lib.Contracts;
using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Model;

public class MissionSiteIdGen : IdGen
{
    public MissionSiteIdGen(List<GameSessionTurn> turns)
    {
        Contract.Assert(turns.Any());
        NextId = turns.Last().EndState.MissionSites.Count;
    }
}