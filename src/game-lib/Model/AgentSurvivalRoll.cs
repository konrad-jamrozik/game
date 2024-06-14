using Lib.Contracts;
using UfoGameLib.Lib;

namespace UfoGameLib.Model;

public class AgentSurvivalRoll
{
    public readonly int SurvivalChance;

    private const int MaxSurvivalChance = 99; // Survival chance is capped at 99%
    private static readonly Range RollRange = new Range(1, 100);

    public readonly int Roll;
    public readonly bool Survived;
    public readonly int? RecoversIn;

    
    public const int MaxRecoversIn = 30;

    public AgentSurvivalRoll(ILog log, IRandomGen randomGen, Agent agent, Mission mission)
    {
        SurvivalChance = ComputeSurvivalChance(agent, mission.Site.Difficulty);
        Roll = randomGen.Roll(RollRange);
        Survived = ComputeSurvived(Roll);
        RecoversIn = ComputeRecoversIn(Roll, SurvivalChance, Survived);
        log.Info(
            $"{agent.LogString} survived {mission.LogString} : {Survived,5}. " +
            $"Skill: {agent.SurvivalSkill,3}, Difficulty: {mission.Site.Difficulty,3}, " +
            $"Roll: {Roll, 3} {(Survived ? "<=" : "> ")} {SurvivalChance,3}," +
            $"{(Survived ? $" RecoversIn: {RecoversIn,3}" : "")}"
        );
    }

    public static bool AgentCanSurvive(Agent agent, Mission mission)
        => ComputeSurvivalChance(agent, mission.Site.Difficulty) > 0;

    /**
     * As of 6/7/2024 the formula is:
     *
     * Agent survival chance = agent survival skill - mission difficulty
     * AND no less than 0%
     * AND no more than 99%
     *
     * BaseMissionSiteDifficulty is 30.
     *
     * As such:
     * Agent skill | Mission difficulty | Survival chance
     * 0           | 30                 | 0%
     * 30          | 30                 | 0%
     * 100         | 30                 | 70%
     * 130         | 30                 | 99% (capped from 100%)
     * 100         | 70                 | 30%
     * 100         | 100                | 0%
     * 150         | 100                | 50%
     * 200         | 100                | 99% (capped from 100%)
     */
    public static int ComputeSurvivalChance(Agent agent, int difficulty)
        => Math.Min(agent.SurvivalSkill - difficulty, MaxSurvivalChance);

    private bool ComputeSurvived(int roll)
    {
        Contract.AssertInRange(roll, RollRange);
        // For an agent to survive, the roll in range [1..100] must be <= the survival chance.
        // Survival chance of 0 means agent never survives, as lowest roll is 1, which is > 0.
        // Survival chance of 99 means agents survives except the roll of 100, which is > 99.
        return roll <= SurvivalChance;
    }

    private int? ComputeRecoversIn(int roll, int survivalChance, bool survived)
    {
        Contract.AssertInRange(roll, RollRange);
        if (!survived)
            return null;
        Contract.AssertInRange(roll, new Range(RollRange.Start, survivalChance));
        // Survival margin denotes how close it was for agent to not survive.
        // Margin of 0 mean the agent barely survived, i.e. the roll is equal to survival chance.
        int survivalMargin = survivalChance - roll;

        // If survival margin is 0, meaning agent barely survived, then they take MaxRecoversIn time
        // to recover. Higher margin means less recovery time, down to minimum of 0.
        int recoversIn = Math.Max(MaxRecoversIn - survivalMargin, 0);
        return recoversIn;
    }
}