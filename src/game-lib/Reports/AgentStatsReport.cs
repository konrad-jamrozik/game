using Lib.Contracts;
using Lib.Data;
using Lib.Primitives;
using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;
using File = Lib.OS.File;

namespace UfoGameLib.Reports;

public class AgentStatsReport : CsvFileReport
{
    private const int TopAgents = 5;

    private readonly ILog _log;
    private readonly GameState _gameState;
    private readonly File _csvFile;
    private readonly int _lastTurn;

    public AgentStatsReport(ILog log, GameState gameState, File csvFile, int lastTurn)
    {
        _log = log;
        _gameState = gameState;
        _csvFile = csvFile;
        _lastTurn = lastTurn;
    }

    public void Write()
    {

        (string header, Func<Agent, int> orderBy)[] data = 
        {
            ("skill", agent => agent.SurvivalSkill),
            ("turns survived", agent => agent.TurnsSurvived(_lastTurn)),
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
                LogAgents(TopAgentsBy(row.orderBy), _lastTurn);
                _log.Info("");
            });

        object[] headerRow = HeaderRow;
        
        object[][] dataRows = DataRows(_gameState);
        
        Contract.Assert(!dataRows.Any() || headerRow.Length == dataRows[0].Length);

        SaveToCsvFile(_log, dataDescription: "agent", new TabularData(headerRow, dataRows), _csvFile);
    }

    private static object[] HeaderRow => new object[]
    {
        // $" | TsInRecovery: {agent.TurnsInRecovery,3}";
         "ID", "Skill", "Turn hired", "Turn term.", "Sacked", "Ts survived", 
         "Mis survived", "Mis succeeded", "Mis failed",
         "Ts in training", "Ts genIncome", "Ts gathIntel", "Ts in ops", "Ts inRecovery"
    };

    private object[][] DataRows(GameState gameState)
    {
        return gameState.AllAgents.OrderBy(agent => agent.Id).Select(
            agent => new object[]
            {
                agent.Id,
                agent.SurvivalSkill,
                agent.TurnHired,
                agent.TurnTerminated!,
                agent.Sacked ? 1 : 0,
                agent.TurnsSurvived(_lastTurn),
                agent.MissionsSurvived,
                agent.MissionsSucceeded,
                agent.MissionsFailed,
                agent.TurnsInTraining,
                agent.TurnsGeneratingIncome,
                agent.TurnsGatheringIntel,
                agent.TurnsInOps,
                agent.TurnsInRecovery
            }).ToArray();
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
        int turnsSurvived = agent.TurnsSurvived(lastTurn);
        Contract.Assert(turnsSurvived >= 0);

        return $"{agent.LogString}" +
               $" | Skill: {agent.SurvivalSkill,3}" +
               $" | T.Hired: {agent.TurnHired,3}" +
               $" | T.Term.: {agent.TurnTerminated,3}" +
               $" | Sacked.: {agent.Sacked,3}" +
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