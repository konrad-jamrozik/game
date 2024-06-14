using Lib.Contracts;
using UfoGameLib.Events;
using UfoGameLib.Lib;
using UfoGameLib.Model;

namespace UfoGameLib.State;

/// <summary>
/// GameSession represents an instance of a game session (a playthrough).
///
/// As such, it maintains a reference to current GameState.
///
/// In addition, it allows updating of the game state by applying PlayerActions.
///
/// GameSession must be accessed directly only by GameSessionController.
/// </summary>
public class GameSession
{
    public readonly RandomGen RandomGen;

    public readonly List<GameSessionTurn> Turns;

    public GameSessionTurn CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<PlayerActionEvent> CurrentPlayerActionEvents => CurrentTurn.EventsInTurn;

    public readonly EventIdGen EventIdGen;

    public readonly AgentIdGen AgentIdGen;

    public readonly MissionIdGen MissionIdGen;

    public readonly MissionSiteIdGen MissionSiteIdGen;

    public GameSession(RandomGen randomGen, List<GameSessionTurn>? turns = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn(startState: GameState.NewInitialGameState(randomGen))];
        Contract.Assert(Turns.Any());
        Turns.ForEach(turn => turn.AssertInvariants());
        
        EventIdGen = new EventIdGen(Turns);
        AgentIdGen = new AgentIdGen(Turns);
        MissionSiteIdGen = new MissionSiteIdGen(Turns);
        MissionIdGen = new MissionIdGen(Turns);
        
    }

    public IReadOnlyList<GameState> GameStates
        => Turns.SelectMany<GameSessionTurn, GameState>(turn => [turn.StartState, turn.EndState])
            .ToList()
            .AsReadOnly();
}