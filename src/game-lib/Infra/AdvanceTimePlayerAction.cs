using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class AdvanceTimePlayerAction : PlayerAction
{
    private readonly ILog _log;
    private readonly RandomGen _randomGen;

    public AdvanceTimePlayerAction(ILog log, RandomGen randomGen)
    {
        _log = log;
        _randomGen = randomGen;
    }

    public override void Apply(GameState state)
    {
        _log.Info("");
        _log.Info("----- Evaluating next turn");
        state.Timeline.CurrentTurn++;

        // The ,4 is alignment specifier per:
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated#structure-of-an-interpolated-string

        int agentsTerminated = EvaluateActiveMissions(state);

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        // Agents cost upkeep.
        int agentUpkeep = state.Assets.Agents.UpkeepCost;

        // Each agent generates income equal to their upkeep times 3.
        int incomeGenerated = state.Assets.Agents.GeneratingIncome.Count * Agent.UpkeepCost * 3;

        int moneyAdjustment = state.Assets.Funding + incomeGenerated - agentUpkeep;

        state.Assets.CurrentMoney += moneyAdjustment;
        state.Assets.CurrentMoney += incomeGenerated;

        // Each agent gathers 5 intel per turn.
        int intelGathered = state.Assets.Agents.GatheringIntel.Count * 5;
        state.Assets.CurrentIntel += intelGathered;

        UpdateAgentStates(state);

        CreateMissionSites(state);

        _log.Info($"===== Turn {state.Timeline.CurrentTurn,4} :");
        _log.Info($"    | Agents alive: {state.Assets.Agents.Count}, " +
                  $"Agents terminated this turn: {agentsTerminated}.");
        _log.Info($"    | CurrentMoney: {state.Assets.CurrentMoney}, " +
                  $"Money adjustment: {moneyAdjustment}, " +
                  $"Funding: {state.Assets.Funding}, " +
                  $"Income generated: {incomeGenerated}, " +
                  $"Agent upkeep: {agentUpkeep}.");
        _log.Info($"    | CurrentIntel: {state.Assets.CurrentIntel}, " +
                  $"Intel gathered: {intelGathered}.");
        _log.Info("");
    }

    private int EvaluateActiveMissions(GameState state)
    {
        int baseDeathChance = 30; // 30% chance for each agent to die
        int agentsTerminated = 0;
        foreach (Mission mission in state.Missions.Active)
        {
            _log.Info($"Evaluating mission with ID {mission.Id}");
            Agents agentsOnMission = state.Assets.Agents.OnSpecificMission(mission);
            foreach (Agent agent in agentsOnMission)
            {
                int survivalRoll = _randomGen.Roll100();
                int agentDeathChance = Math.Max(baseDeathChance - agent.TurnsTrained, 0);
                
                if (survivalRoll <= agentDeathChance)
                {
                    state.Terminate(agent);
                    _log.Info($"Agent with ID {agent.Id,4} terminated. Roll: {survivalRoll,3} <= {agentDeathChance}");
                    agentsTerminated++;
                }
                else
                {
                    agent.MakeAvailable();
                    _log.Info($"Agent with ID {agent.Id,4} survived.   Roll: {survivalRoll,3} >  {agentDeathChance}");
                }
            }
            mission.IsActive = false;
        }

        return agentsTerminated;
    }

    private static void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.InTransit.ForEach(agent => agent.MakeAvailable());
        state.Assets.Agents.InTraining.ForEach(agent => agent.TurnsTrained++);
    }

    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            _log.Info($"Add MissionSite with Id: {siteId}");
            state.MissionSites.Add(new MissionSite(siteId));
        }
    }
}