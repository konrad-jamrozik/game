using System.Text.Json;
using Lib.Json;
using UfoGameLib.Lib;

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
    public static readonly JsonSerializerOptions StateJsonSerializerOptions = GetJsonSerializerOptions();
    public readonly RandomGen RandomGen;

    public readonly List<GameState> PastGameStates = new List<GameState>();
    public GameState CurrentGameState = GameState.NewInitialGameState();

    public GameSession(RandomGen randomGen)
    {
        RandomGen = randomGen;
    }

    public GameState? PreviousGameState => PastGameStates.Any() ? PastGameStates.Last() : null;

    public void SaveState()
        => PastGameStates.Add(CurrentGameState.Clone(StateJsonSerializerOptions));

    private static JsonSerializerOptions GetJsonSerializerOptions()
    {
        // The difference between the returned options and converterOptions
        // is that options has Converters defined, while converterOptions
        // doesn't. If instead we would try to use options in place
        // of converterOptions, then we will would end up in infinite loop of:
        // options --> have converter --> the converter has options -->
        // these options have converter --> ...
        //
        // Note that the JsonStringEnumConverter() defined within converterOptions
        // is a "leaf" Converter in the sense it doesn't need any other of the settings
        // defined in the options of which it is part of.

        // Define "base" JsonSerializerOptions that do not have Converters defined.
        var converterOptions = GameStateJsonConverter.JsonSerializerOptions();

        // Define the "top-level" options to be returned, having the same settings
        // as "converterOptions".
        var options = new JsonSerializerOptions(converterOptions);

        // Attach Converters to "options" but not "converterOptions"
        options.Converters.Add(new GameStateJsonConverter());

        return options;
    }
}