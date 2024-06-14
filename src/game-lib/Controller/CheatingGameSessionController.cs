using UfoGameLib.Lib;
using UfoGameLib.State;

namespace UfoGameLib.Controller;

/// <summary>
/// A GameSessionController that allows for cheating by making it possible to:
/// - View entire game state, even parts that the player should not have access to.
/// - Do actions that are invalid by standard game rules, like adding money.
/// </summary>
public class CheatingGameSessionController : GameSessionController
{
    public CheatingGameSessionController(Configuration config, ILog log, IRandomGen randomGen, GameSession gameSession)
        : base(
            config,
            log,
            gameSession)
    {
    }

    public GameState GameState()
        => GameSession.CurrentGameState;

    public void AddMoney(int count)
        => throw new NotImplementedException();
}