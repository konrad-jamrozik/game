using UfoGameLib.Model;

namespace UfoGameLib.State;

public class GameStatePlayerView
{
    private readonly GameSession _session;

    public GameStatePlayerView(GameSession session)
    {
        _session = session;
    }

    public int CurrentTurn => _session.CurrentGameState.Timeline.CurrentTurn;
    public Missions Missions => _session.CurrentGameState.Missions;
    public MissionSites MissionSites => _session.CurrentGameState.MissionSites;
    public Assets Assets => _session.CurrentGameState.Assets;
    public Agents TerminatedAgents => _session.CurrentGameState.TerminatedAgents;
}