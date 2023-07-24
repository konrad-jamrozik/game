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

    /// <summary>
    /// This field contains game the game state that was serialized by last call to .Save();
    ///
    /// This fields exists primarily to facilitate testing serialization and deserialization
    /// behavior by making calls to Save(), then Load() and then using JsonDiff.
    ///
    /// Upon Save(), the saved game state is present in LastSavedGameState.
    /// Upon Load(), the loaded save file is deserialized into CurrentGameState.
    /// 
    /// As a result, it is possible to do JsonDiff between LastSavedGameState
    /// and CurrentGameState.
    ///
    /// Importantly, while the CurrentGameState went through the process of deserialization
    /// due to a call to Load(), the LastSavedGameState didn't.
    ///
    /// Contrast this with the naive approach of obtaining the previous game state to JsonDiff
    /// not from LastSavedGameState, but from PreviousGameState. This would be a mistake,
    /// because PreviousGameState is obtained from a state that has been deserialized upon
    /// a call to GameSession.SaveState(); from within Load().
    ///
    /// As a result, both previous and current JsonDiffed game state would have been deserialized,
    /// hence not catching any bugs where deserialization fails to serialize some field properly.
    /// 
    /// </summary>
    public GameState? LastSavedGameState = null;

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