using UfoGameLib.State;

namespace UfoGameLib.Controller;

/// <summary>
/// The AdvanceTimePlayerAction should never be used, except for its name, via nameof() operator.
///
/// Conceptually, it is up to the player to decide when to advance time.
/// It is expected that a frontend will present to the user the action of advancing time as a player action.
///
/// However, from the implementation point of view, the time advancement is a special case and
/// cannot be triggered as other player actions.
///
/// Specifically, during the turn, the GameSessionController.PlayGameUntilOver() invokes in a loop
///
///   player.PlayGameTurn(GameStatePlayerView, GameTurnController)
///
/// which allows the player to invoke player actions via GameTurnController, with input data provided from the GameStatePlayerView.
/// 
/// The GameTurnController by design does not allow the player to advance time. Once the implementation of PlayGameTurn
/// reaches end of execution, this signals for the GameSessionController loop (in PlayGameUntilOver()) to advance time
/// and invoke PlayGameTurn again, if applicable.
/// </summary>
public abstract class AdvanceTimePlayerAction : PlayerAction
{
    protected override (List<int>? ids, int? targetId) ApplyImpl(GameState state)
    {
        throw new InvalidOperationException(
            $"{nameof(AdvanceTimePlayerAction)} should never be applied." +
            $"Instead, {nameof(TimeAdvancementController)} should be called.");
    }
}