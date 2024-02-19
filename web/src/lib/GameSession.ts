/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { GameSessionContext } from '../components/GameSessionProvider'
import { initialTurn, type GameState } from './GameState'
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

export function useGameSession(
  storedGameSessionData?: GameSessionData | undefined,
): GameSession {
  const [data, setData] = useState<GameSessionData>(
    storedGameSessionData ?? initialGameSessionData,
  )
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
      throw new Error('gameStates must not be empty')
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

  public revertToPreviousTurn(): void {
    const previousTurnsGameStates: GameState[] = this.data.gameStates.slice(
      0,
      -1,
    )
    const newGameSessionData = {
      gameStates: previousTurnsGameStates,
      startOfCurrentTurnGameState: previousTurnsGameStates.at(-1),
    }
    // kja add abstraction fro always setting local storage together with setData
    localStorage.setItem('gameSessionData', JSON.stringify(newGameSessionData))
    this.setData(newGameSessionData)
  }

  public resetCurrentTurn(): void {
    const previousTurnsGameStates: GameState[] = this.data.gameStates.slice(
      0,
      -1,
    )
    const newGameSessionData = {
      gameStates: [
        ...previousTurnsGameStates,
        this.data.startOfCurrentTurnGameState!,
      ],
      startOfCurrentTurnGameState: this.data.startOfCurrentTurnGameState,
    }
    localStorage.setItem('gameSessionData', JSON.stringify(newGameSessionData))
    this.setData(newGameSessionData)
  }

  public wipe(): void {
    localStorage.removeItem('gameSessionData')
    this.setData(initialGameSessionData)
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

  public getPlayerMadeActionsInCurrentTurn(): boolean {
    return (
      this.isLoaded() &&
      this.data.gameStates.at(-1)!.UpdateCount >
        this.data.startOfCurrentTurnGameState!.UpdateCount
    )
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
    this.setGameSessionData(gameStatesAfterUpsertion)
  }

  private setGameSessionData(gameStates: GameState[]): void {
    GameSession.verify(gameStates)
    // set startOfCurrentTurnGameState to the current state from gameStates
    // only if it has a higher turn number.
    // If the current state from gameStates has the same current turn number
    // it means the current turn game state was modified (presumably by player action)
    // and hence startOfCurrentTurnGameState should remain unchanged.
    const startOfCurrentTurnGameState =
      this.data.startOfCurrentTurnGameState?.Timeline.CurrentTurn !==
      gameStates.at(-1)?.Timeline.CurrentTurn
        ? gameStates.at(-1)
        : this.data.startOfCurrentTurnGameState
    const newData: GameSessionData = {
      ...this.data,
      gameStates,
      startOfCurrentTurnGameState,
    }

    localStorage.setItem('gameSessionData', JSON.stringify(newData))
    this.setData(newData)
    this.setLoading(false)
    this.setError('')
  }
}

export type GameResult = 'won' | 'lost' | 'undecided'

export type GameSessionData = {
  readonly gameStates: readonly GameState[]
  readonly startOfCurrentTurnGameState: GameState | undefined
}

const initialGameSessionData: GameSessionData = {
  gameStates: [],
  startOfCurrentTurnGameState: undefined,
}

// Consider for later:
// using a reducer to manage game sates:
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// using immer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
