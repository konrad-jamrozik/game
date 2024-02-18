/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { GameSessionContext } from '../components/GameSessionProvider'
import { initialTurn, type GameState } from './GameState'
import type { PlayerActionPayload } from './PlayerActionPayload'
import { callAdvanceTurnsApi } from './api/advanceTurnsApi'
import {
  type PlayerActionName,
  callApplyPlayerActionApi,
  playerActionsPayloadsProviders,
} from './api/applyPlayerActionApi'
import { agentHireCost, transportCapBuyingCost } from './ruleset'

export function useGameSessionContext(): GameSession {
  return useContext(GameSessionContext)
}

export function useGameSession(): GameSession {
  const [data, setData] = useState<GameSessionData>(initialGameSessionData)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  return new GameSession(data, setData, loading, setLoading, error, setError)
}

export class GameSession {
  // eslint-disable-next-line @typescript-eslint/max-params
  public constructor(
    private readonly data: GameSessionData,
    private readonly setData: React.Dispatch<
      React.SetStateAction<GameSessionData>
    >,
    public readonly loading: boolean,
    private readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    public readonly error: string | undefined,
    private readonly setError: React.Dispatch<
      React.SetStateAction<string | undefined>
    >,
  ) {
    this.data = data
  }

  private static verify(gameStates: readonly GameState[]): void {
    if (_.isEmpty(gameStates)) {
      return
    }
    const firstTurn = gameStates.at(0)!.Timeline.CurrentTurn
    // Verify that CurrentTurn increments in all gameStates
    if (
      !_.every(
        gameStates,
        (gs, index) => gs.Timeline.CurrentTurn === firstTurn + index,
      )
    ) {
      throw new Error('gameStates must have sequential turns')
    }
  }

  public async advanceTurns(
    startTurn: number,
    targetTurn: number,
    delegateToAi?: boolean | undefined,
  ): Promise<void> {
    const startGameState = this.getStateAtTurn(startTurn)
    const newGameStates = await callAdvanceTurnsApi({
      setLoading: this.setLoading,
      setError: this.setError,
      startGameState,
      targetTurn,
      delegateToAi,
    })
    if (!_.isUndefined(newGameStates)) {
      this.upsertGameStates(newGameStates)
    }
  }

  public async applyPlayerAction(
    playerActionName: PlayerActionName,
    ids?: number[] | undefined,
    targetId?: number | undefined,
  ): Promise<boolean> {
    const currentGameState = this.getCurrentState()
    const newGameState = await callApplyPlayerActionApi({
      setLoading: this.setLoading,
      setError: this.setError,
      currentGameState,
      playerActionPayload: playerActionsPayloadsProviders[playerActionName]({
        ids,
        targetId,
      }),
    })

    if (!_.isUndefined(newGameState)) {
      this.upsertGameStates([newGameState])
      return true
    }
    return false
  }

  public canHire1Agent(): boolean {
    // kja need method for (isLoaded && !isGameOver). Like: isInProgress
    return (
      this.isLoaded() &&
      !this.isGameOver() &&
      this.getCurrentState().Assets.Money >= agentHireCost
    )
  }

  public canBuy1TransportCap(): boolean {
    // kja need method for (isLoaded && !isGameOver). Like: isInProgress
    return (
      this.isLoaded() &&
      !this.isGameOver() &&
      this.getCurrentState().Assets.Money >= transportCapBuyingCost(1)
    )
  }

  public getGameStates(): readonly GameState[] {
    return this.data.gameStates
  }

  public isLoaded(): boolean {
    return !_.isEmpty(this.data.gameStates)
  }

  public setGameStates(gameStates: GameState[]): void {
    GameSession.verify(gameStates)
    this.setData({
      ...this.data,
      gameStates,
    })
    this.setLoading(false)
    this.setError('')
  }

  public getCurrentTurn(): number {
    return this.getCurrentState().Timeline.CurrentTurn
  }

  public getCurrentTurnUnsafe(): number | undefined {
    return this.getCurrentStateUnsafe()?.Timeline.CurrentTurn
  }

  public getGameResult(): GameResult {
    const lastGameState = this.getCurrentState()
    return lastGameState.IsGameWon
      ? 'won'
      : lastGameState.IsGameLost
        ? 'lost'
        : 'undecided'
  }

  // kja getStateAtTurn() will require more precision: at the start of the turn, or end of the turn?
  public getStateAtTurn(turn: number): GameState {
    return _.findLast(
      this.data.gameStates,
      (gs) => gs.Timeline.CurrentTurn === turn,
    )!
  }

  public isGameOver(): boolean {
    const lastGameState = this.getCurrentState()
    return lastGameState.IsGameOver
  }

  public isGameOverUnsafe(): boolean | undefined {
    const lastGameState = this.getCurrentStateUnsafe()
    return lastGameState?.IsGameOver
  }

  // kja rename to getCurrentGameState
  public getCurrentState(): GameState {
    return this.data.gameStates.at(-1)!
  }

  // kja rename to getCurrentGameStateUnsafe
  public getCurrentStateUnsafe(): GameState | undefined {
    return this.data.gameStates.at(-1)
  }

  public upsertGameStates(newGameStates: GameState[]): void {
    if (_.isEmpty(newGameStates)) {
      throw new Error('newGameStates must not be empty')
    }

    const firstTurnInNewGameStates = newGameStates.at(0)!.Timeline.CurrentTurn
    const lastTurnInNewGameStates = newGameStates.at(-1)!.Timeline.CurrentTurn

    const retainedGameStatesSliceStart = 0
    const retainedGameStatesSliceEnd = firstTurnInNewGameStates - initialTurn

    const retainedGameStates = this.getGameStates().slice(
      retainedGameStatesSliceStart,
      retainedGameStatesSliceEnd,
    )
    const firstTurnInRetainedGameStates =
      retainedGameStates.at(0)?.Timeline.CurrentTurn
    const lastTurnInRetainedGameStates =
      retainedGameStates.at(-1)?.Timeline.CurrentTurn

    console.log(
      `Upserting game states. ` +
        `currentTurn: ${this.getCurrentTurnUnsafe()}, ` +
        `firstTurnInNewGameStates: ${firstTurnInNewGameStates}, ` +
        `retainedGameStates turns: [ ${firstTurnInRetainedGameStates} - ${lastTurnInRetainedGameStates} ], ` +
        `newGameStates turns: [ ${firstTurnInNewGameStates} - ${lastTurnInNewGameStates} ]`,
    )

    const gameStatesAfterUpsertion = [...retainedGameStates, ...newGameStates]
    this.setGameStates(gameStatesAfterUpsertion)
  }
}

export type GameResult = 'won' | 'lost' | 'undecided'

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
