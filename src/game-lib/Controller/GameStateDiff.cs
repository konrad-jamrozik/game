using UfoGameLib.Lib;
using UfoGameLib.Model;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

internal class GameStateDiff
{
    private readonly GameState _prev;
    private readonly GameState _curr;

    public GameStateDiff(GameState prev, GameState curr)
    {
        _prev = prev;
        _curr = curr;
    }

    public void PrintTo(ILog log)
    {
        log.Info("");
        log.Info(
            _prev.Timeline.CurrentTurn == _curr.Timeline.CurrentTurn
                ? $"Player actions in turn {_prev.Timeline.CurrentTurn}"
                : $"Result of turn {_prev.Timeline.CurrentTurn}");

        List<(Agent? prev, Agent? curr)> agentDiffs = _prev.AllAgents.OrderBy(a => a.Id)
            .ZipLongest(_curr.AllAgents.OrderBy(a => a.Id), (prev, curr) => (prev, curr)).ToList();

        agentDiffs.ForEach(
            agentDiff =>
            {
                if (agentDiff.prev is not { IsTerminated: true })
                    log.Info(AgentDiffLog(agentDiff.prev, agentDiff.curr!));
            });
    }

    // kja this is not that useful, at least for now.
    private string AgentDiffLog(Agent? prev, Agent curr)
    {
        string prevState = prev?.CurrentState.ToString() ?? "";
        string currState = curr.CurrentState.ToString();
        if (curr.IsOnMission)
            currState += $" ID: {curr.CurrentMission!.Id}";
        string stateLog = prevState != currState 
            ? $"{prevState,16} -> {currState,-16}" 
            : $"{prevState,16} -> {"\"",-16}";

        string prevSkill = prev != null ? Ruleset.AgentSurvivalSkill(prev).ToString() : "";
        string currSkill = Ruleset.AgentSurvivalSkill(curr).ToString();
        string skillLog = prevSkill != currSkill 
            ? $"{prevSkill,3} -> {currSkill,-3}" 
            : $"{prevSkill,3} -> {"\"",-3}";

        string prevRecoversIn = prev?.RecoversIn.ToString() ?? "";
        string currRecoversIn = curr.RecoversIn.ToString();
        string recoversInLog = prevRecoversIn != currRecoversIn
            ? $"{prevRecoversIn,3} -> {currRecoversIn,-3}" 
            : $"{prevRecoversIn,3} -> {"\"",-3}";

        return $"Agent ID: {curr.Id,3} | State: {stateLog,36} | Skill: {skillLog,10} | RecoversIn: {recoversInLog,10}";
    }
}