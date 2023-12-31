using UfoGameLib.Model;

namespace UfoGameLib.State;

public class GameStatePlayerView(GameState state)
{
    private readonly GameState _state = state;

    public GameStatePlayerView(GameSession session) : this(session.CurrentGameState)
    {
    }

    public int CurrentTurn => _state.Timeline.CurrentTurn;
    public Missions Missions => _state.Missions;
    public MissionSites MissionSites => _state.MissionSites;
    public Assets Assets => _state.Assets;
    public Agents TerminatedAgents => _state.TerminatedAgents;

    public bool StateReferenceEquals(GameState state)
        => ReferenceEquals(state, _state);

    public bool StateReferenceEquals(GameStatePlayerView view)
        => ReferenceEquals(view._state, _state);
}