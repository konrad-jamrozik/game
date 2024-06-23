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
    public readonly IRandomGen RandomGen;

    public readonly List<GameSessionTurn> Turns;

    public GameSessionTurn CurrentTurn => Turns.Last();

    public GameState CurrentGameState => CurrentTurn.EndState;

    public List<PlayerActionEvent> CurrentPlayerActionEvents => CurrentTurn.EventsInTurn;

    public readonly EventIdGen EventIdGen;

    public readonly AgentIdGen AgentIdGen;

    public readonly MissionIdGen MissionIdGen;

    public readonly MissionSiteIdGen MissionSiteIdGen;

    public GameSession(IRandomGen randomGen, List<GameSessionTurn>? turns = null, Factions? factions = null)
    {
        RandomGen = randomGen;
        Turns = turns ?? [new GameSessionTurn(startState: GameState.NewInitialGameState(randomGen, factions))];
        EventIdGen = new EventIdGen(Turns);
        AgentIdGen = new AgentIdGen(Turns);
        MissionSiteIdGen = new MissionSiteIdGen(Turns);
        MissionIdGen = new MissionIdGen(Turns);
        AssertInvariants();
    }

    public IReadOnlyList<GameState> GameStates
        => Turns.SelectMany<GameSessionTurn, GameState>(turn => [turn.StartState, turn.EndState])
            .ToList()
            .AsReadOnly();

    public void AssertInvariants()
    {
        Contract.Assert(Turns.Any());
        Turns.ForEach(turn => turn.AssertInvariants());
        List<GameEvent> gameEvents = Turns.SelectMany(turn => turn.GameEvents).ToList();
        List<GameState> gameStates = Turns.SelectMany(turn => turn.GameStates).ToList();
        IdGen.AssertConsecutiveIds(gameEvents);
        gameStates.ForEach(gs => gs.AssertInvariants());
    }

    public void AddTurn(GameSessionTurn turn)
    {
        Turns.Add(turn);
        AssertInvariants();
    }

    public void ReplaceCurrentTurnWithState(GameState gs)
    {
        var currentTurn = Turns.Last();
        Turns.RemoveAt(Turns.Count - 1);
        AddTurn(
            new GameSessionTurn(
                eventsUntilStartState: currentTurn.EventsUntilStartState,
                startState: gs));

    }
}