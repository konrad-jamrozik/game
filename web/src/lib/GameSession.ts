/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { Md5 } from 'ts-md5'
import { GameSessionContext } from '../components/GameSessionProvider'
import {
  type GameSessionDataType,
  GameSessionData,
  initialGameSessionData,
} from './GameSessionData'
import { callAdvanceTurnsApi } from './api/advanceTurnsApi'
import { callApplyPlayerActionApi } from './api/applyPlayerActionApi'
import { playerActionsPayloadsProviders } from './api/playerActionsPayloadsProviders'
import { initialTurn, type GameState, type Assets } from './codesync/GameState'
import type {
  AgentPlayerActionName,
  PlayerActionPayload,
} from './codesync/PlayerActionPayload'
import { agentHireCost, transportCapBuyingCost } from './codesync/ruleset'

export function useGameSessionContext(): GameSession {
  return useContext(GameSessionContext)
}

export function useGameSession(
  storedGameSessionData?: GameSessionDataType | undefined,
): GameSession {
  const [data, setData] = useState<GameSessionDataType>(
    storedGameSessionData ?? initialGameSessionData,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  console.log(
    `useGameSession: data: '${Md5.hashStr(JSON.stringify(data))}', loading: '${loading}', error: '${error}'`,
  )

  return new GameSession(
    new GameSessionData(data, setData),
    loading,
    setLoading,
    error,
    setError,
  )
}

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
    const startGameState = this.getGameStateAtTurn(startTurn)
    const newGameStates = await callAdvanceTurnsApi({
      setLoading: this.setLoading,
      setError: this.setError,
      startGameState,
      targetTurn,
      delegateToAi,
    })
    if (!_.isUndefined(newGameStates)) {
      this.upsertGameStates(newGameStates)
      return true
    }
    return false
  }

  public async hireAgents(count: number): Promise<boolean> {
    if (count !== 1) {
      throw new Error(
        'Currently hiring of only exactly 1 agent at a time is supported. See playerActionsPayloadsProviders for details.',
      )
    }
    const payloadProvider = playerActionsPayloadsProviders.HireAgents
    const payload = payloadProvider()
    return this.applyPlayerAction(payload)
  }

  public async buyTransportCap(count: number): Promise<boolean> {
    if (count !== 1) {
      throw new Error(
        'Currently buying exactly 1 transport cap. at a time is supported. See playerActionsPayloadsProviders for details.',
      )
    }
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
    this.data.revertToPreviousTurn()
  }

  public resetCurrentTurn(): void {
    this.data.resetCurrentTurn()
  }

  public resetGame(): void {
    this.data.resetData()
  }

  public canHire1Agent(): boolean {
    return (
      this.isInProgress() &&
      !this.loading &&
      this.getAssets().Money >= agentHireCost
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
    return this.getCurrentGameState().Timeline.CurrentTurn
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

  public getGameStateAtTurn(turn: number): GameState {
    return _.findLast(
      this.data.getGameStates(),
      (gs) => gs.Timeline.CurrentTurn === turn,
    )!
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

  public hasPlayerMadeActionsInCurrentTurn(): boolean {
    if (!this.isInitialized()) {
      return false
    }

    const currentGameState = this.data.getGameStates().at(-1)
    const resetGameState = this.data.getResetGameState()
    return currentGameState!.UpdateCount > resetGameState.UpdateCount
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
        (!this.isGameOver() && !this.hasPlayerMadeActionsInCurrentTurn()))
    return canDelegateTurnsToAi
  }

  public isInProgress(): boolean {
    return this.isInitialized() && !this.isGameOver()
  }

  public getCurrentGameState(): GameState {
    return this.data.getGameStates().at(-1)!
  }

  public getAssets(): Assets {
    return this.getCurrentGameState().Assets
  }

  public getAssetsUnsafe(): Assets | undefined {
    return this.getCurrentGameStateUnsafe()?.Assets
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.data.getGameStates().at(-1)
  }

  public upsertGameStates(
    newGameStates: GameState[],
    resultOfPlayerAction?: boolean,
  ): void {
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
    this.data.setDataStates(
      gameStatesAfterUpsertion,
      Boolean(resultOfPlayerAction),
    )
    this.setLoading(false)
    this.setError('')
  }

  private async applyPlayerAction(
    playerActionPayload: PlayerActionPayload,
  ): Promise<boolean> {
    const currentGameState = this.getCurrentGameState()
    const newGameState = await callApplyPlayerActionApi({
      setLoading: this.setLoading,
      setError: this.setError,
      currentGameState,
      playerActionPayload,
    })

    if (!_.isUndefined(newGameState)) {
      this.upsertGameStates([newGameState], true)
      return true
    }
    return false
  }
}

export type GameResult = 'won' | 'lost' | 'undecided'
