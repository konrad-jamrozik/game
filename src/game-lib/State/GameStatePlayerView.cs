using UfoGameLib.Model;

namespace UfoGameLib.State;

/// <summary>
/// A player view of a GameState 'state'.
///
/// The GameStatePlayerView is a restricted, read-only view of a GameState.
/// It restricts access to the GameState to only the parts that the player,
/// implementing IPlayer interface, is allowed to see.
///
/// The GameStatePlayerView accepts as input Func(GameState) instead of just
/// GameState to make it possible to create GameStatePlayerView that logically
/// always references the current GameSession.CurrentGameState, even if the underlying
/// CurrentGameState reference was reassigned.
/// 
/// An important scenario where the reference is reassigned is loading a saved game state.
/// When this happens, we want the GameStatePlayerView to reference the loaded CurrentGameState.
/// For details, see GameSessionController.LoadCurrentGameStateFromFile.
/// 
/// For details on behavior of GameStatePlayerView, see GameStateTests.
/// </summary>
public class GameStatePlayerView(Func<GameState> state) : IEquatable<GameStatePlayerView>
{
    private readonly Func<GameState> _state = state;

    public int CurrentTurn => _state().Timeline.CurrentTurn;
    public Missions Missions => _state().Missions;
    public MissionSites MissionSites => _state().MissionSites;
    public Assets Assets => _state().Assets;
    public Agents TerminatedAgents => _state().TerminatedAgents;

    public bool StateReferenceEquals(GameStatePlayerView view)
        => ReferenceEquals(view._state(), _state());

    public bool Equals(GameStatePlayerView? other)
        => _state().Equals(other?._state());

    public override bool Equals(object? obj)
        => Equals(obj as GameStatePlayerView);

    public override int GetHashCode()
        => _state().GetHashCode();
}