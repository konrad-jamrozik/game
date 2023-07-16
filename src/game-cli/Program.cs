using CommandLine;
using Lib.OS;
using UfoGameLib.Infra;
using UfoGameLib.Model;

namespace UfoGameCli;

internal static class Program
{
    private static void Main(string[] args)
    {
        var config = new Configuration(new FileSystem());
        using var log = new Log(config);
        var randomGen = new RandomGen(new Random());

        var controller = new GameSessionController(config, log, new GameSession(log, randomGen));

        // Need to support here the various scenarios described in GameSessionController comment.

        Parser.Default.ParseArguments<AdvanceTimeOptions, HireAgentsOptions, LaunchMissionOptions>(args)
            .WithParsed<AdvanceTimeOptions>(options => InvokeAdvanceTime(controller))
            .WithParsed<HireAgentsOptions>(options => InvokeHireAgents(controller, options.AgentCount))
            .WithParsed<LaunchMissionOptions>(
                options => InvokeLaunchMission(controller, options.MissionSiteId, options.AgentCount, options.Region))
            .WithParsed<FireAgentsOptions>(options => InvokeFireAgents(controller, options.AgentNames));
    }

    private static void InvokeAdvanceTime(GameSessionController controller)
    {

        controller.AdvanceTime();
        Console.WriteLine("Time advanced.");
    }

    private static void InvokeHireAgents(GameSessionController game, int count)
    {
        game.HireAgents(count);
        Console.WriteLine($"Hired {count} agents.");
    }

    private static void InvokeLaunchMission(GameSessionController game, int siteId, int count, string region)
    {
        MissionSite site = game.GameStatePlayerView.MissionSites.Single(site => site.Id == siteId);
        game.LaunchMission(site, count);
        Console.WriteLine($"Launched mission with {count} agents in region {region}.");
    }

    private static void InvokeFireAgents(GameSessionController game, IEnumerable<string> agentNames)
    {
        // not implemented; commented below is obsolete generated code.
        // game.SackAgents(agentNames);
        Console.WriteLine($"Fired agents: {string.Join(", ", agentNames)}");
    }
}

// ReSharper disable ClassNeverInstantiated.Global
[Verb("advance-time", HelpText = "Advance the game time.")]
internal class AdvanceTimeOptions
{}

[Verb("hire-agents", HelpText = "Hire a specific number of agents.")]
internal class HireAgentsOptions
{
    [Option('c', "count", Required = true, HelpText = "Number of agents to hire.")]
    public int AgentCount { get; set; }
}

[Verb("launch-mission", HelpText = "Launch a mission with a specific number of agents.")]
internal class LaunchMissionOptions
{
    [Option('i', "siteId", Required = true, HelpText = "ID of the mission site.")]
    public int MissionSiteId { get; set; }

    [Option('c', "count", Required = true, HelpText = "Number of agents for the mission.")]
    public int AgentCount { get; set; }

    [Option('r', "region", Required = true, HelpText = "Region for the mission.")]
    public string Region { get; set; } = "";
}

[Verb("fire-agents", HelpText = "Fire a list of agents by their names.")]
internal class FireAgentsOptions
{
    [Option('n', "names", Required = true, Separator = ',', HelpText = "Comma-separated list of agent names to fire.")]
    public IEnumerable<string> AgentNames { get; set; } = new List<string>();
}
// ReSharper restore ClassNeverInstantiated.Global