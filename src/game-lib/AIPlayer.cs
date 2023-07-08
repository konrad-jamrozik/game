using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameLib;

public class AIPlayer
{
    private const int MaxAgentsToSendOnMission = 2;
    private readonly GameSessionController _controller;

    public AIPlayer(GameSessionController controller)
    {
        _controller = controller;
    }

    public void PlayGameSession()
    {
        GameStatePlayerView gameStateView = _controller.GameStatePlayerView;

        while (!gameStateView.IsGameOver)
        {
            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {gameStateView.CurrentTurn} Current money: {gameStateView.Assets.CurrentMoney}");
            
            while (CanLaunchSomeMission(gameStateView))
            {
                MissionSite targetSite = ChooseMissionSite(gameStateView);
                HireAgentsIfNecessary(gameStateView);
                _controller.LaunchMission(targetSite, gameStateView.Assets.Agents.Count);
            }
            Console.Out.WriteLine(
                $"----- AIPlayer Current turn: {gameStateView.CurrentTurn} DONE");
            // kja3 this _game.AdvanceTime(), the while !GameOver and reference to _controller should come from base abstract/template method.
            
            _controller.AdvanceTime();
        }

        _controller.Save();
        // kja2 to implement AI Player
        // DONE First level:
        // - Advance time until mission available
        // - Once mission available, hire agents up to transport limit and send on mission
        // - Repeat until player loses game (at this point impossible to win)
        // 
        // Next level:
        // - Try to always keep at least enough agents to maintain full transport capacity
        // - Send agents on intel-gathering duty until mission is available
        // - Send agents on available mission if not too hard
        // - Do not hire agents if it would lead to bankruptcy
    }

    private static bool CanLaunchSomeMission(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.Any(site => site.IsActive) && gameStateView.Assets.CurrentTransportCapacity > 0;

    private static MissionSite ChooseMissionSite(GameStatePlayerView gameStateView)
        => gameStateView.MissionSites.First(site => site.IsActive);

    private void HireAgentsIfNecessary(GameStatePlayerView gameStateView)
    {
        int agentsToHire = Math.Max(
            Math.Min(gameStateView.Assets.CurrentTransportCapacity, MaxAgentsToSendOnMission) -
            gameStateView.Assets.Agents.Count,
            0);
        _controller.HireAgents(agentsToHire);
    }
}