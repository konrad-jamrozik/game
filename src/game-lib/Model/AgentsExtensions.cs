using Lib.Primitives;

namespace UfoGameLib.Model;

public static class AgentsExtensions
{
    public static Agents ToAgents(this IEnumerable<Agent> agentsEnumerable, bool? terminated = false) 
        => new Agents(agentsEnumerable, terminated);

    public static Agents ToAgents(this Agent agent, bool? terminated = false) 
        => new Agents(agent.WrapInList(), terminated);
}