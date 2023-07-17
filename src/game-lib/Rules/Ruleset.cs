using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.Rules;

public static class Ruleset
{
    public const int AgentSurvivalRollUpperBound = 100;

    public const int AgentTrainingCoefficient = 1;

    public const int BaseMissionSiteDifficulty = 30;

    public static bool RollForAgentSurvival(
        Agent agent,
        Mission mission,
        RandomGen randomGen,
        ILog log)
    {
        int survivalRoll = randomGen.Roll1To(AgentSurvivalRollUpperBound);
        int deathThreshold = AgentDeathThreshold(agent, mission);
        bool survived = survivalRoll > deathThreshold;
        log.Info(
            $"Agent with ID {agent.Id,4} survived: {survived,5}. Skill: {AgentSurvivalSkill(agent),3}. " +
            $"Roll: {survivalRoll,3} { (survived ? "> " : "<=") } {deathThreshold}");

        return survived;
    }

    public static bool MissionSuccessful(Mission mission, int agentsSurviving)
    {
        int agentsRequired = RequiredSurvivingAgentsForSuccess(mission.Site);
        return agentsSurviving >= agentsRequired;
    }

    public static int AgentDeathThreshold(Agent agent, Mission mission) => Math.Max(mission.Site.Difficulty - AgentSurvivalSkill(agent), 0);

    public static bool AgentCanSurvive(Agent agent, Mission mission) => AgentDeathThreshold(agent, mission) <= AgentSurvivalRollUpperBound;

    public static int AgentSurvivalSkill(Agent agent) => agent.TurnsTrained * AgentTrainingCoefficient;

    public static int MissionSiteDifficulty(int currentTurn, RandomGen randomGen)
        // Note that currently the only way of increasing agents survivability of difficulty
        // is via training. As such, if difficulty due to turn would grow at least as fast as Agent.TrainingCoefficient,
        // then at some point missions would become impossible, as all agents would die.
        => BaseMissionSiteDifficulty 
           + (currentTurn * AgentTrainingCoefficient/4)
           + randomGen.Roll0To(30);

    public static int RequiredSurvivingAgentsForSuccess(MissionSite site)
    {
        int result = 1 + (site.Difficulty - BaseMissionSiteDifficulty) / 30;
        Debug.Assert(result >= 1);
        return result;
    }
}