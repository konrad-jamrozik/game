using UfoGameLib.Model;

namespace UfoGameLib.Infra;

public class AdvanceTimePlayerAction : PlayerAction
{
    private static readonly Agent.State[] TransientAgentStates =
    {
        Agent.State.InTransit,
    };

    private readonly ILog _log;
    private readonly Random _random;

    public AdvanceTimePlayerAction(ILog log, Random random)
    {
        _log = log;
        _random = random;
    }

    public override void Apply(GameState state)
    {
        _log.Info("----- Evaluating next turn");
        state.Timeline.CurrentTurn++;

        // The ,4 is alignment specifier per:
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated#structure-of-an-interpolated-string

        int agentsTerminated = EvaluateActiveMissions(state);

        // Each turn all transport capacity gets freed up.
        state.Assets.CurrentTransportCapacity = state.Assets.MaxTransportCapacity;

        // Agents cost upkeep.
        state.Assets.CurrentMoney -= state.Assets.Agents.UpkeepCost;

        UpdateAgentStates(state);

        CreateMissionSites(state);

        _log.Info($"===== Turn {state.Timeline.CurrentTurn,4} :");
        _log.Info($"    | Agents alive: {state.Assets.Agents.Alive.Count}, " +
                  $"Agents terminated this turn: {agentsTerminated}, " +
                  $"CurrentMoney: {state.Assets.CurrentMoney}, " +
                  $"Funding: {state.Assets.Funding}, " +
                  $"Agent upkeep: {state.Assets.Agents.UpkeepCost}");
    }

    private int EvaluateActiveMissions(GameState state)
    {
        int deathChance = 30; // 30% chance for each agent to die
        int agentsTerminated = 0;
        foreach (Mission mission in state.Missions.Active)
        {
            _log.Info($"Evaluating mission with ID {mission.Id}");
            Agents agentsOnMission = state.Assets.Agents.OnSpecificMission(mission);
            foreach (Agent agent in agentsOnMission)
            {
                int survivalRoll = _random.Next(100) + 1;
                
                if (survivalRoll <= deathChance)
                {
                    agent.Terminate();
                    _log.Info($"Agent with ID {agent.Id,4} terminated. Roll: {survivalRoll,3} <= {deathChance}");
                    agentsTerminated++;
                }
                else
                {
                    agent.MakeAvailable();
                    _log.Info($"Agent with ID {agent.Id,4} survived.   Roll: {survivalRoll,3} >  {deathChance}");
                }
            }
            mission.IsActive = false;
        }

        return agentsTerminated;
    }

    private static void UpdateAgentStates(GameState state)
    {
        state.Assets.Agents.Alive.ForEach(
            agent =>
            {
                if (TransientAgentStates.Contains(agent.CurrentState))
                {
                    agent.MakeAvailable();
                }
            });
    }

    private void CreateMissionSites(GameState state)
    {
        if (state.Timeline.CurrentTurn % 3 == 0)
        {
            int siteId = state.NextMissionSiteId;
            _log.Info($"Add MissionSite with Id: {siteId}");
            state.MissionSites.Add(new MissionSite(siteId, isActive: true));
        }
    }
}