using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Reports;

public class MissionStatsReport
{
    private readonly ILog _log;
    private readonly GameState _gameState;

    public MissionStatsReport(ILog log, GameState gameState)
    {
        _log = log;
        _gameState = gameState;
    }

    public void Write()
    {
        // kja LogMissionStats
        // Includes: most bloody mission
        // Top 5 hardest missions
        // Top 5 won hardest mission
        // Top 5 missions by terminated agents
        // Top 5 won missions by terminated agents
        // Top 5 missions with least amount of agents lost
        // Top 5 lost missions with least amount of agents lost
    }
}