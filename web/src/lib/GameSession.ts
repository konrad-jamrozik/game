/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useState } from 'react'
import type { GameState } from './GameState'
import { getCurrentState } from './GameStateUtils'
import type { PlayerActionPayload } from './PlayerActionPayload'
import { callApiToAdvanceTimeBy1Turn } from './api'

export function useGameSession(): GameSession {
  const [data, setData] = useState<GameSessionData>(initialGameSessionData)
  return new GameSession(data, setData)
}

export class GameSession {
  public constructor(
    private readonly data: GameSessionData,
    private readonly setData: React.Dispatch<
      React.SetStateAction<GameSessionData>
    >,
  ) {
    this.data = data
  }

  public async advanceTimeBy1Turn(
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  ): Promise<GameState[] | undefined> {
    const newGameState = await callApiToAdvanceTimeBy1Turn({
      setLoading,
      setError,
      currentGameState: this.getCurrentGameState(),
    })
    if (!_.isUndefined(newGameState)) {
      // eslint-disable-next-line sonarjs/prefer-immediate-return
      const newGameStates = this.appendNextTurnGameState(newGameState)
      return newGameStates
    }
    return undefined
  }

  public getGameStates(): readonly GameState[] {
    return this.data.gameStates
  }

  public setGameStates(gameStates: GameState[]): void {
    this.setData({
      ...this.data,
      gameStates,
    })
  }

  public appendNextTurnGameState(gameState: GameState): GameState[] {
    const newGameStates = [...this.data.gameStates, gameState]
    console.log(`appendNextTurnGameState()`)
    this.setData({
      ...this.data,
      gameStates: newGameStates,
    })
    return newGameStates
  }

  public getCurrentGameState(): GameState | undefined {
    return this.data.gameStates.length > 0
      ? getCurrentState(this.data.gameStates)
      : undefined
  }
}

type GameSessionData = {
  readonly gameStates: readonly GameState[]
  readonly currentTurnGameStates: readonly GameState[]
  readonly currentTurnPlayerActions: readonly PlayerActionPayload[]
}

const initialGameSessionData: GameSessionData = {
  gameStates: [],
  currentTurnGameStates: [],
  currentTurnPlayerActions: [],
}

// I am going to need:

// a reducer that operates on a data structure that involves GameState[], among others: read on at [1].
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// And probably wanna use useImmer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
// I will need following reducer actions (called with dispatch):
// - Append "next turn" game state, as a result of a call to the backend API
//   - Special case, where the state is the first one (new game session)
// - Insert/append an array of game states fetched from an API, one per each turn start
//   - These game states will assume the game was played by an AI player.
//   - These game states are from turns N to M, possibly overwriting existing states.
// - Append "current turn" game state, as a result of player action (with result coming from backend)
// - Reset "current turn" game state to last of the historical game states, i.e. beginning of current turn
// - Revert to beginning of some previous historical turn, destroying all the follow up states.
//   - Special case: revert just by one turn

// [1]:
// Note the useState will likely operate not only on one GameState[], but two:
// - A series of all historical game states, at turn starts
// - A series of game states in current turn, reflecting various player actions taken
// Hence it will actually be an object like:
// { gameStates: GameState[], currentTurnStates: GameState[], playerActions: PlayerAction[] }
// where playerActions corresponds to the currentTurnStates:
// n-th action started on n-th current turn state and produced n+1-th current turn state.

// I could then wrap the code described above into equivalent of the custom hooks from
// https://react.dev/learn/scaling-up-with-reducer-and-context#moving-all-wiring-into-a-single-file
//
// export function useTasks() {
//     return useContext(TasksContext);
//   }
//
//   export function useTasksDispatch() {
//     return useContext(TasksDispatchContext);
//   }
//
// but instead return a class https://www.typescriptlang.org/docs/handbook/2/classes.html
// or maybe just a custom hook, need to read on that:
// https://react.dev/learn/reusing-logic-with-custom-hooks
// Note the doc says: Hooks may return arbitrary values.
// So I could return a class instance from a hook.
// https://react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks

// Question: should the code also call backend? E.g.:
// https://react.dev/reference/react/useEffect#fetching-data-with-effects
// - see especially deep-dive, which mentions TanStack Query (React Query)
// https://react.dev/reference/react/useEffect#what-are-good-alternatives-to-data-fetching-in-effects
// Mention about react providing fetching:
// https://react.dev/learn/reusing-logic-with-custom-hooks#custom-hooks-help-you-migrate-to-better-patterns
// https://react.dev/learn/reusing-logic-with-custom-hooks#will-react-provide-any-built-in-solution-for-data-fetching
// Note: I don't want effects, I want events:
// Per: https://react.dev/learn/synchronizing-with-effects
// > Effects let you specify side effects that are caused by rendering itself, rather than by a particular event.

// Overall looks like the reusable logic will at its core have useState of the two GameState[] arrays and player
// actions (see [1])
// with reducer actions on top, and some extra logic for fetching data from backend [2], most likely using
// https://tanstack.com/query/latest
// Then I pack it up into custom hooks (see below) that returns a class for the read-hook,
// to also give access to the functions as currently visible in GameStateUtils.ts, e.g. getStateAtTurn or getCurrentTurn
// or a new one: getPlayerActions

// [2]:
// reducers must be pure per:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#recap
// so I need logic that does the data fetching and then calls the reducer. And that logic will need to integrate with
// 'is loading' and 'has error' to properly display in a component. Basically se what simulate.ts and applyPlayerAction.ts
// is doing.
// Maybe there are separate abstractions here:
// 1. GameSession, exposing pure read/write state, internally using a reducer and state
// 2. ApiLayer, exposing interface to get data from backend and allowing to hook into component parts like 'isLading'
//   - this part will likely use TanStack Query (see links above)
// 3. A "game session controller" component, that calls ApiLayer, shows API call state and result,
//   and updates GameSession if successful
// 4. All the other components that display GameSession, by doing "useGameSession" custom hook.
