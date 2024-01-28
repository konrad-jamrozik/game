using System.Text.Json;
using Lib.Tests.Json;
using UfoGameLib.State;

namespace UfoGameLib.Tests;

public class GameStateTests
{
    [SetUp]
    public void Setup()
    {
    }

    /// <summary>
    /// This test proves that:
    /// - Cloning of a game state works as expected.
    /// - Equality of game states works as expected.
    /// - Equality of player views of game states works as expected.
    /// - Equality of game states referenced by player views works as expected.
    ///
    /// Specifically:
    /// 
    /// Given:
    /// - An original game state, which is an arbitrary game state (here: initial game state)).
    /// - A player view of it, and a second player view of it.
    /// - A clone of that game state.
    /// - A player view of the clone of that game state.
    /// - A modified clone of that game state.
    ///
    /// The following holds:
    /// - Game state player views retain references to game states they were created with.
    /// - A clone of game state is equal to the original (source of the cloned) game state.
    /// - A game state player view referencing a cloned game state is
    ///   equal to a player view of the original game state, because both these
    ///   views reference game states that are equal.
    /// - A modified clone of a game state is not equal to the original game state.
    /// - A game state player view referencing a modified clone of a game state
    ///   is not equal to a player view of the original game state, because these
    ///   views reference game states that are not equal.
    /// </summary>
    [Test]
    public void CloningAndViewAndEqualityBehaveCorrectly()
    {
        var originalGameState = GameState.NewInitialGameState();
        var originalGameStateView = new GameStatePlayerView(() => originalGameState);
        var originalGameStateView2 = new GameStatePlayerView(() => originalGameState);

        // Act: clone the game state
        var clonedState = originalGameState.Clone();

        var clonedStateView = new GameStatePlayerView(() => clonedState);

        Assert.Multiple(() =>
        {
            // Act: exercise game state equality
            Assert.That(clonedState, Is.EqualTo(originalGameState));
            
            // Act: exercise game state view equality
            Assert.That(clonedStateView, Is.EqualTo(originalGameStateView));

            // Act: exercise game state view game state reference equality
            Assert.That(originalGameStateView2.StateReferenceEquals(originalGameStateView));
            Assert.That(!originalGameStateView.StateReferenceEquals(clonedStateView));

            // Arrange: modify the cloned game state
            clonedState.Timeline.CurrentTurn += 1;

            /*
               This assertion is necessary, in addition to:
               
                 Assert.That(clonedState, Is.EqualTo(initialState));
               
               Without properly implemented equality the "Is.EqualTo" assert would pass,
               even though the objects are not equal.
               This is because NUnit 4.0.0 compares all public properties. See:
               https://github.com/nunit/nunit/pull/4436
               https://github.com/nunit/nunit/issues/4394
               Above are mentioned in:
               https://docs.nunit.org/articles/nunit/release-notes/framework.html#enhancements
               linked from:
               https://docs.nunit.org/articles/nunit/release-notes/breaking-changes.html#nunit-40
               I originally migrated to this new behavior by updating NUnit to 4.0.0, in this commit:
               https://github.com/konrad-jamrozik/game/commit/fa17b0985af7adde4f135be3d231555b6e7621ee#diff-718fb94a7176526686c9940ce6d3b5350e548e26a234b86a7cdd4817e68b3b52R10
            */
            Assert.That(clonedState, Is.Not.EqualTo(originalGameState));
            Assert.That(clonedStateView, Is.Not.EqualTo(originalGameStateView));
        });
    }

    /// <summary>
    /// This test is here to unit test how ASP.NET Core is going to deserialize GameState
    /// from the route parameter bindings, like:
    ///
    ///   app.MapPost("/exampleRoute" /// (GameState gs) => ... );
    ///
    /// See also:
    /// - Relevant issue to make errors clearer:
    ///   [System.Text.Json] : More accurate error messages when failing to map fields or parameters #88048
    ///   https://github.com/dotnet/runtime/issues/88048
    /// - https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/deserialization
    /// - https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/configure-options#web-defaults-for-jsonserializeroptions
    /// - https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/immutability
    /// </summary>
    [Test]
    public void DeserializeGameStateFromInitialGameStateJsonString()
    {
        GameState initialGameState = GameState.NewInitialGameState();
        string initialJsonString = initialGameState.ToJsonString();

        // Act
        GameState deserializedGameState = JsonSerializer.Deserialize<GameState>(initialJsonString, GameState.StateJsonSerializerOptions)!;
        
        string deserializedJsonString = deserializedGameState.ToJsonString();

        new JsonDiffAssertion(baseline: initialJsonString, target: deserializedJsonString).Assert();
    }
}