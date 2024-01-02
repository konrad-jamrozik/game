using UfoGameLib.Model;

namespace UfoGameLib.State;

/// <summary>
/// A player view of a GameState 'state'.
///
/// The GameStatePlayerView is a restricted, read-only view of a GameState.
/// It restricts access to the GameState to only the parts that the player,
/// implementing IPlayer interface, is allowed to see.
///
/// For details on behavior of GameStatePlayerView, see GameStateTests.
/// </summary>
public class GameStatePlayerView(GameState state)
{
    private readonly GameState _state = state;

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