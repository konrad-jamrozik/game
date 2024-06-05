/* eslint-disable sonarjs/no-inverted-boolean-check */
/* eslint-disable max-statements */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { Md5 } from 'ts-md5'
import { GameSessionContext } from '../../components/GameSessionProvider'
import { callAdvanceTurnsApi } from '../api/advanceTurnsApi'
import { callApplyPlayerActionApi } from '../api/applyPlayerActionApi'
import { playerActionsPayloadsProviders } from '../api/playerActionsPayloadsProviders'
import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import { initialTurn, type Assets, type GameState } from '../codesync/GameState'
import type {
  AgentPlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'
import { agentHireCost, transportCapBuyingCost } from '../codesync/ruleset'
import type { StoredData } from '../storedData/StoredData'
import type { GameEvent } from './GameEvent'
import {
  GameSessionData,
  initialGameSessionData,
  type GameSessionDataType,
} from './GameSessionData'

export function useGameSessionContext(): GameSession {
  return useContext(GameSessionContext)
}

export function useGameSession(storedData: StoredData): GameSession {
  const storedGameSessionData: GameSessionDataType | undefined =
    storedData.getGameSessionData()
  const [data, setData] = useState<GameSessionDataType>(
    storedGameSessionData ?? initialGameSessionData,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  console.log(
    `useGameSession: data: '${Md5.hashStr(JSON.stringify(data))}', loading: '${loading}', error: '${error}'`,
  )

  return new GameSession(
    new GameSessionData(storedData, data, setData),
    loading,
    setLoading,
    error,
    setError,
  )
}

export type GameResult = 'won' | 'lost' | 'undecided'

export class GameSession {
  public constructor(
    private readonly data: GameSessionData,

    public readonly loading: boolean,
    private readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    public readonly error: string | undefined,
    private readonly setError: React.Dispatch<
      React.SetStateAction<string | undefined>
    >,
  ) {
    this.data = data
  }

  public async advanceTurns(
    startTurn: number,
    targetTurn: number,
    delegateToAi?: boolean | undefined,
  ): Promise<boolean> {
    const startGameState: GameState | undefined =
      this.getGameStateAtTurnEndUnsafe(startTurn)
    const newGameStates = await callAdvanceTurnsApi({
      setLoading: this.setLoading,
      setError: this.setError,
      startGameState,
      targetTurn,
      delegateToAi,
    })
    if (!_.isUndefined(newGameStates)) {
      this.upsertGameStates(newGameStates)
      if (delegateToAi === false) {
        this.upsertAdvanceTurnGameEvent()
      }
      // future work: upsert here game world events, once callAdvanceTurnsApi returns them.
      return true
    }
    return false
  }

  public async hireAgents(count: number): Promise<boolean> {
    const payloadProvider = playerActionsPayloadsProviders.HireAgents
    const payload = payloadProvider(count)
    return this.applyPlayerAction(payload)
  }

  public async buyTransportCap(count: number): Promise<boolean> {
    /* c8 ignore start */
    if (count !== 1) {
      throw new Error(
        'Currently buying exactly 1 transport cap. at a time is supported. See playerActionsPayloadsProviders for details.',
      )
    }
    /* c8 ignore stop */
    const payloadProvider = playerActionsPayloadsProviders.BuyTransportCap
    const payload = payloadProvider()
    return this.applyPlayerAction(payload)
  }

  public async launchMission(
    agentsIds: number[],
    missionSiteId: number,
  ): Promise<boolean> {
    const payloadProvider = playerActionsPayloadsProviders.LaunchMission
    const payload = payloadProvider(agentsIds, missionSiteId)
    return this.applyPlayerAction(payload)
  }

  public async applyBatchAgentPlayerAction(
    playerActionName: AgentPlayerActionName,
    agentsIds: number[],
  ): Promise<boolean> {
    const payloadProvider = playerActionsPayloadsProviders[playerActionName]
    const payload = payloadProvider(agentsIds)
    return this.applyPlayerAction(payload)
  }

  public revertToPreviousTurn(): void {
    /* c8 ignore start */
    if (this.hasPlayerMadeActionsInCurrentTurn() ?? true) {
      throw new Error(
        'Cannot revert turn when player has made actions or game is not initialized',
      )
    }
    if (this.getCurrentTurn() === initialTurn) {
      throw new Error(
        `Cannot revert turn when current turn is initialTurn of ${initialTurn}`,
      )
    }
    /* c8 ignore stop */
    this.data.revertToPreviousTurn()
  }

  public resetCurrentTurn(): void {
    /* c8 ignore start */
    if (!(this.hasPlayerMadeActionsInCurrentTurn() ?? false)) {
      throw new Error("Cannot reset turn when player hasn't made any actions")
    }
    /* c8 ignore stop */
    this.data.resetCurrentTurn()
  }

  public resetGame(): void {
    this.data.resetData()
  }

  public canHireAgents(count: number): boolean {
    return (
      this.isInProgress() &&
      !this.loading &&
      this.getAssets().Money >= agentHireCost * count
    )
  }

  public canBuy1TransportCap(): boolean {
    return (
      this.isInProgress() &&
      !this.loading &&
      this.getAssets().Money >= transportCapBuyingCost(1)
    )
  }

  public getGameStates(): readonly GameState[] {
    return this.data.getGameStates()
  }

  public isInitialized(): boolean {
    return !_.isEmpty(this.data.getGameStates())
  }

  public getCurrentTurn(): number {
    return this.data.getCurrentTurn()
  }

  public getCurrentTurnUnsafe(): number | undefined {
    return this.getCurrentGameStateUnsafe()?.Timeline.CurrentTurn
  }

  public getGameResultUnsafe(): GameResult | undefined {
    if (!this.isInitialized()) {
      return undefined
    }
    return this.getGameResult()
  }

  public getGameResult(): GameResult {
    const lastGameState = this.getCurrentGameState()
    return lastGameState.IsGameWon
      ? 'won'
      : lastGameState.IsGameLost
        ? 'lost'
        : 'undecided'
  }

  public getGameStateAtTurnEndUnsafe(turn: number): GameState | undefined {
    return _.findLast(
      this.data.getGameStates(),
      (gs) => gs.Timeline.CurrentTurn === turn,
    )
  }

  public isGameOverUnsafe(): boolean | undefined {
    if (!this.isInitialized()) {
      return undefined
    }
    return this.isGameOver()
  }

  public isGameOver(): boolean {
    return this.getCurrentGameState().IsGameOver
  }

  public hasPlayerMadeActionsInCurrentTurn(): boolean | undefined {
    if (!this.isInitialized()) {
      return undefined
    }

    const currentGameState = this.getCurrentGameState()
    const getGameStateAtCurrentTurnStart = this.getGameStateAtCurrentTurnStart()
    return (
      currentGameState.UpdateCount > getGameStateAtCurrentTurnStart.UpdateCount
    )
  }

  public canAdvanceTime(): boolean {
    const canAdvanceTime =
      !this.loading && (!this.isInitialized() || !this.isGameOver())
    return canAdvanceTime
  }

  public canDelegateTurnsToAi(): boolean {
    const canDelegateTurnsToAi =
      !this.loading &&
      (!this.isInitialized() ||
        (!this.isGameOver() &&
          !(this.hasPlayerMadeActionsInCurrentTurn() ?? false)))
    return canDelegateTurnsToAi
  }

  public isInProgress(): boolean {
    return this.isInitialized() && !this.isGameOver()
  }

  public getGameStateAtCurrentTurnStart(): GameState {
    return this.data.getGameStateAtCurrentTurnStart()
  }

  public getAssets(): Assets {
    return this.getCurrentGameState().Assets
  }

  public getAssetsUnsafe(): Assets | undefined {
    return this.getCurrentGameStateUnsafe()?.Assets
  }

  public getCurrentGameState(): GameState {
    return this.data.getCurrentGameState()
  }

  public getGameEvents(): readonly GameEvent[] {
    return this.data.getGameEvents()
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.data.getCurrentGameStateUnsafe()
  }

  public upsertGameStates(
    newGameStates: GameState[],
    resultOfPlayerAction?: boolean,
  ): void {
    /* c8 ignore start */
    if (_.isEmpty(newGameStates)) {
      throw new Error('newGameStates must not be empty')
    }
    if (this.isGameOverUnsafe() === true) {
      throw new Error('Cannot upsert game states to game that is over')
    }
    if (resultOfPlayerAction === true && !this.isInitialized()) {
      throw new Error(
        'The upserted game state cannot be result of player action when the game is not initialized.',
      )
    }
    if (resultOfPlayerAction === true && newGameStates.length !== 1) {
      throw new Error(
        'Exactly one new game state must be upserted as a result of player action',
      )
    }
    /* c8 ignore stop */

    const firstTurnInNewGameStates = newGameStates.at(0)!.Timeline.CurrentTurn
    const lastTurnInNewGameStates = newGameStates.at(-1)!.Timeline.CurrentTurn

    const retainedGameStates = this.getRetainedGameStates(
      resultOfPlayerAction,
      firstTurnInNewGameStates,
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
    this.data.setGameStates(gameStatesAfterUpsertion)
    this.setLoading(false)
    this.setError('')
  }

  public upsertGameEvent(playerActionPayload: PlayerActionPayload): void {
    const gameEvents = this.getGameEvents()
    const gameEventMaxId = gameEvents.at(-1)?.Id ?? 0
    const newGameEventId = gameEventMaxId + 1
    const newGameEvent: GameEvent<PlayerActionPayload> = {
      Id: newGameEventId,
      Turn: this.getCurrentTurn(),
      Payload: playerActionPayload,
    }
    const newGameEvents: GameEvent[] = [...gameEvents, newGameEvent]
    this.data.setGameEvents(newGameEvents)
  }

  public upsertAdvanceTurnGameEvent(): void {
    const payloadProvider = playerActionsPayloadsProviders.AdvanceTime
    const payload = payloadProvider()
    this.upsertGameEvent(payload)
  }

  private async applyPlayerAction(
    playerActionPayload: PlayerActionPayload,
  ): Promise<boolean> {
    const currentGameState = this.getCurrentGameState()
    const newGameSessionTurn: GameSessionTurn | undefined =
      await callApplyPlayerActionApi({
        setLoading: this.setLoading,
        setError: this.setError,
        currentGameState,
        playerActionPayload,
      })
    if (!_.isUndefined(newGameSessionTurn)) {
      const newGameState = newGameSessionTurn.GameState
      this.upsertGameStates([newGameState], true)
      // kja upsert newGameSessionTurn.GameEvents[0] here
      this.upsertGameEvent(playerActionPayload)
      return true
    }
    return false
  }

  private getRetainedGameStates(
    resultOfPlayerAction: boolean | undefined,
    firstTurnInNewGameStates: number,
  ): GameState[] {
    const gameStates = this.getGameStates()
    let retainedGameStates: GameState[] = []
    if (this.isInitialized()) {
      if (resultOfPlayerAction === true) {
        if (this.hasPlayerMadeActionsInCurrentTurn() ?? false) {
          // If player already made actions in the current turn
          // Then update (replace) the current state with new game state
          const retainedGameStatesSliceEnd = -1
          retainedGameStates = sliceRetainedGameStates(
            retainedGameStatesSliceEnd,
          )
          /* c8 ignore start */
          if (!(retainedGameStates.at(-1) === this.getGameStates().at(-2))) {
            throw new Error(
              'if (!(retainedGameStates.at(-1) === this.getGameStates().at(-2)))',
            )
          }
          /* c8 ignore end */
        } else {
          // If player did not make actions in the current turn
          // Then insert (append) the new state after the current state
          const retainedGameStatesSliceEnd = undefined
          retainedGameStates = sliceRetainedGameStates(
            retainedGameStatesSliceEnd,
          )
          /* c8 ignore start */
          if (!(retainedGameStates.at(-1) === this.getGameStates().at(-1))) {
            throw new Error(
              'if (!(retainedGameStates.at(-1) === this.getGameStates().at(-1)))',
            )
          }
          /* c8 ignore end */
        }
      } else {
        // If the game session is initialized and the new states are not a result of player action
        // then the new states could be a result of delegating turns to AI.
        // Retain all the game states up to the turn before the first turn in the new game states.
        const retainedGameStatesSliceEnd = _.takeWhile(
          this.getGameStates(),
          (gs) => gs.Timeline.CurrentTurn < firstTurnInNewGameStates,
        ).length
        retainedGameStates = sliceRetainedGameStates(retainedGameStatesSliceEnd)
      }
    } else {
      // If the game session is not initialized, i.e. there are no existing game states, insert all the new states.
      const retainedGameStatesSliceEnd = 0
      retainedGameStates = sliceRetainedGameStates(retainedGameStatesSliceEnd)
      /* c8 ignore start */
      if (!_.isEmpty(retainedGameStates)) {
        throw new Error(
          'Invalid state: game not initialized but retained game states are not empty',
        )
      }
      /* c8 ignore stop */
    }
    return retainedGameStates

    function sliceRetainedGameStates(
      retainedGameStatesSliceEnd: number | undefined,
    ): GameState[] {
      const retainedGameStatesSliceStart = 0
      return gameStates.slice(
        retainedGameStatesSliceStart,
        retainedGameStatesSliceEnd,
      )
    }
  }
}
