using Lib.Data;
using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

// kja output this to a csv file and create Excel table out of it
public class AgentStatsReport : CsvFileReport
{
    private const int TopAgents = 5;

    private readonly ILog _log;
    private readonly GameState _gameState;
    private readonly File _csvFile;

    public AgentStatsReport(ILog log, GameState gameState, File csvFile)
    {
        _log = log;
        _gameState = gameState;
        _csvFile = csvFile;
    }

    public void Write()
    {
        int lastTurn = _gameState.Timeline.CurrentTurn - 1;

        (string header, Func<Agent, int> orderBy)[] data = 
        {
            ("skill", agent => agent.SurvivalSkill),
            ("turns survived", agent => TurnsSurvived(agent, lastTurn)),
            ("missions survived", agent => agent.MissionsSurvived),
            ("turns in training", agent => agent.TurnsInTraining),
            ("turns generating income", agent => agent.TurnsGeneratingIncome),
            ("turns gathering intel", agent => agent.TurnsGatheringIntel),
            ("turns in recovery", agent => agent.TurnsInRecovery)
        };

        data.ForEach(
            row =>
            {
                _log.Info("");
                _log.Info($"Top {TopAgents} agents by {row.header}:");
                LogAgents(TopAgentsBy(row.orderBy), lastTurn);
                _log.Info("");
            });

        object[] headerRow = HeaderRow;
        
        object[][] dataRows = DataRows(_gameState);
        
        Debug.Assert(!dataRows.Any() || headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(_log, dataDescription: "agent", new TabularData(headerRow, dataRows), _csvFile);
    }

    private static object[] HeaderRow => new object[]
    {
         // kja curr work
    };

    private static object[][] DataRows(GameState gameState)
    {
        return new object[][] { }; // kja curr work
    }

    private static int TurnsSurvived(Agent agent, int lastTurn)
    {
        int agentEndTurn = agent.TurnTerminated ?? lastTurn;
        int turnsSurvived = agentEndTurn - agent.TurnHired;
        return turnsSurvived;
    }

    private Agents TopAgentsBy(Func<Agent, int> orderBy)
        => _gameState.AllAgents
            .OrderByDescending(orderBy)
            .ThenBy(agent => agent.Id)
            .Take(TopAgents)
            .ToAgents(terminated: null);

    private void LogAgents(Agents agents, int lastTurn)
        => agents.ForEach(agent => _log.Info(AgentLogString(agent, lastTurn)));

    private static string AgentLogString(Agent agent, int lastTurn)
    {
        int turnsSurvived = TurnsSurvived(agent, lastTurn);
        Debug.Assert(turnsSurvived >= 0);

        return $"{agent.LogString}" +
               $" | Skill: {agent.SurvivalSkill,3}" +
               $" | Terminated: {agent.IsTerminated,5}" +
               $" | T.Hired: {agent.TurnHired,3}" +
               $" | T.Term.: {agent.TurnTerminated,3}" +
               $" | TsSurvived: {turnsSurvived,3}" +
               $" | Mis.Survived: {agent.MissionsSurvived,3}" +
               $" | Mis.Succeeded: {agent.MissionsSucceeded,3}" +
               $" | Mis.Failed: {agent.MissionsFailed,3}" +
               $" | TsInTraining: {agent.TurnsInTraining,3}" +
               $" | TsGenIncome: {agent.TurnsGeneratingIncome,3}" +
               $" | TsGathIntel: {agent.TurnsGeneratingIncome,3}" +
               $" | TsInRecovery: {agent.TurnsInRecovery,3}";
    }
}