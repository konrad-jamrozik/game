namespace UfoGameLib.Model;

public static class AgentEnumerableExtensions
{
    public static Agents ToAgents(this IEnumerable<Agent> agentsEnumerable, bool terminated = false) 
        => new Agents(agentsEnumerable, terminated);
}