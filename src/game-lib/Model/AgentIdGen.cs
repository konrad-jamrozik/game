using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Model;

public class AgentIdGen : IdGen
{
    public AgentIdGen(List<GameSessionTurn> turns)
    {
        NextId = turns.Last().EndState.AllAgents.Count;
    }
}
