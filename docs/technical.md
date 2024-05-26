# Technical

This document contains various technical deep-dives for my own reference.

In this document `.` refers to the repository root.

## Things to do periodically

Run `npm-check-updates --upgrade` from `game/web` to update dependencies.
See e.g. [this commit](https://github.com/konrad-jamrozik/game/commit/5950149545d9894bc0a3defcb742c0cf7a55179b).

Also consider checking for unused dependencies:

- https://stackoverflow.com/questions/22675725/how-to-find-unused-packages-in-package-json

## About React context

- https://react.dev/learn/passing-data-deeply-with-context
- https://react.dev/learn/scaling-up-with-reducer-and-context
- https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/

## About vitest

- https://github.com/vitest-dev/vitest/issues/4494
- https://kentcdodds.com/blog/improve-test-error-messages-of-your-abstractions

### Ignoring lines for code coverage

https://jestjs.io/docs/configuration#collectcoverage-boolean

### CI tests and cold boot

CI tests may sometimes fail due to relying on cloud backend and slow cold boot:
they hit a timeout. Re-running works as the API is booted and replies within timeout.

This also appears to be mitigated by `verifyBackendApiIsReachable` ran at
the beginning of each test suite, which tries to reach the backend and thus force
it to boot.

## React: post-processing result of API call

Consider following problem:

What if I want to call backend API, get the result and based on the result do a one-time
conditional update to some state?

I encountered it specifically when solving the following:

I need it specifically to determine when to show up the game outro dialog.
If it is to pop-up, it must happen exactly once, as a result of the data returned from the backend.
It should not happen again on further rerenders.

I solved this by a two-step process simulating a "one-time" event:

1. When the backend call returns it says if game state was updated or not. If it was, it sets the `turnAdvanced`
   state. This will trigger future re-render.
2. When the re-render happens and sees the `turnAdvanced` is true, it sets it to false, thus preventing further
   re-renders thinking that game state updated.

While this solution works it feels clunky. I was concerned it introduces extra re-render, but my profiling with
`console.log()` to log component rerenders shows that while App.tsc, which owns the state `turnAdvanced`, indeed
re-renders, it happens in the same render done by React, as observed in React profiler. This is probably caused
by the batching: https://react.dev/learn/queueing-a-series-of-state-updates

Ideally, when the backend API call returns, instead of setting `turnAdvanced` to true,
I could immediately determine if outro dialog needs to be shown and if so, set appropriate state.

However: normal re-render determines if to show outro dialog based on the react state containing the game session state,
but when the backend API call updating the game session state returns, the react state is not updated yet.

Basically the flow as implemented is as follows:

``` typescript
// In "advance time" button click handler:
    const newGameState = await backendApiCall()
    gameState.update(newGameState)
    turnAdvanced.set(true)

// On re-render, in top-level "App" logic
    if (showOutroDialog(gameState, turnAdvanced)) { showOutroDialog = true }
    if (turnAdvanced) { turnAdvanced = false }
```

But I would wish for this flow, but it violates React rules:

``` typescript
// In "advance time" button click handler:
   newGameState = await backendApiCall()
   // ❗Trying to immediately access the new state instead of letting react first save it and then read on re-render.
   //   Albeit this may be OK per this recommendation: https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations
   updatedGameState = gameState.update(newGameState)
   // ❗CONCEPTUAL COUPLING ❗ This code should not know about outro dialog.
   // Perhaps pass as input callback argument? See also https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers
   if (showOutroDialog(updatedGameState)) { showOutroDialog = true }
```

Another possible approach is 'trend' variable, maybe over 'isGameOver':
https://react.dev/reference/react/useState#storing-information-from-previous-renders

I had a chat with ChatGPT about this here:
https://chatgpt.com/g/g-AVrfRPzod-react-ai/c/b1bffd24-2aa1-4899-80a3-855c1b6c2843?oai-dm=1
It recommended 'useEffect' but I think this is the wrong approach.
What convinced me is the [discussion about 'chain of computations'].
and the fact this scenario is a one-time response to a user-trigger API call returning,
instead of some kind of synchronization that needs to be updated independently of user actions.
Money quote from [sending a POST request] denoting this is definitely not an effect:

> When you choose whether to put some logic into an event handler or an Effect, the main question you need to answer is
> what kind of logic it is from the user’s perspective. If this logic is caused by a particular interaction, keep it in
> the event handler. If it’s caused by the user seeing the component on the screen, keep it in the Effect.

[discussion about 'chain of computations']: https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations
[sending a POST request]: https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request
More links:

- https://react.dev/learn/synchronizing-with-effects
- https://react.dev/learn/separating-events-from-effects
- https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
- https://react.dev/reference/react/useState#storing-information-from-previous-renders
- https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers
- https://stackoverflow.com/questions/58818727/react-usestate-not-setting-initial-value
