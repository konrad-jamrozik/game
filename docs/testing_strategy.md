# Testing strategy

The testing strategy, i.e. overall approach to testing, is primarily based on
simulating entire game sessions with AI players.

## Assertions

All code is augmented with strong suite of invariants: preconditions, postconditions and assertions.

## Backend simulations

In the backend, AI player implements the `IPlayer` interface by inheriting from `AIPlayer`.

It then plays the game by having its `PlayGameTurn` method repeatedly invoked by the `GameSessionController`.

On a high-level, the test suite is thus composed of tests which play entire game sessions using various AI players.

As the AI players exercise the game logic, the multitude of assertions in the codebase are executed, thus ensuring
the code works correctly.

Advanced AI players exercise all the game features, ensuring all the code is tested.

## Frontend simulations for manual analysis

Furthermore, to ensure game is balanced properly, including if it is not too easy and also winnable at all,
the frontend has ability to choose the AI player to play the game, make it play, and then load up the game
session results to the UI, to be manually analyzed how the game session went.

## Reproducible simulations

In case bugs are found, and in general, to be able to repeat specific test game sessions,
the code is designed to support random seeding with specific seed.

Such seeds may be then used as basis of specific tests that have especially interesting game session run or
reproduce specific bug.

## Integration tests

Besides the game session simulations, there are few other tests, mostly focusing on ensuring
the system components integrate well, including:

- frontend can call backend and receive the response
- game session state can be serialized and deserialized
