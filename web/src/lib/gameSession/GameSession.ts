/* eslint-disable @typescript-eslint/max-params */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { Md5 } from 'ts-md5'
import { GameSessionContext } from '../../components/GameSessionProvider'
import { callAdvanceTurnsApi } from '../api/advanceTurnsApi'
import { callApplyPlayerActionApi } from '../api/applyPlayerActionApi'
import { playerActionsPayloadsProviders } from '../api/playerActionsPayloadsProviders'
import type { GameEventWithTurn } from '../codesync/GameEvent'
import {
  getTurnNo,
  getTurnNoUnsafe,
  removeAdvanceTimeEvent,
  resetTurn,
  type GameSessionTurn,
} from '../codesync/GameSessionTurn'
import { initialTurn, type Assets, type GameState } from '../codesync/GameState'
import type { AgentPlayerActionName } from '../codesync/PlayerActionName'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'
import type { AIPlayerName } from '../codesync/aiPlayer'
import { agentHireCost, transportCapBuyingCost } from '../codesync/ruleset'
import { measureTiming } from '../dev'
import type { StoredData } from '../storedData/StoredData'
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
  const [savedTurn, setSavedTurn] = useState<number | undefined>(
    data.turns.at(-1)?.StartState.Timeline.CurrentTurn,
  )

  console.log(
    `render useGameSession. Elapsed: ${measureTiming()}. data: '${Md5.hashStr(JSON.stringify(data))}', loading: '${loading}', error: '${error}', savedTurn: '${savedTurn}'`,
  )

  useEffect(() => {
    console.log(
      `render useGameSession: DONE. Elapsed: ${measureTiming()}. loading: '${loading}', error: '${error}'`,
    )
  }, [loading, error])

  return new GameSession(
    new GameSessionData(storedData, data, setData),
    loading,
    setLoading,
    error,
    setError,
    savedTurn,
    setSavedTurn,
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
    public readonly savedTurn: number | undefined,
    private readonly setSavedTurn: React.Dispatch<
      React.SetStateAction<number | undefined>
    >,
  ) {
    this.data = data
  }

  public async advanceTurns(
    startTurn: number,
    targetTurn: number,
    aiPlayer?: AIPlayerName | undefined,
  ): Promise<boolean> {
    let startGameTurn: GameSessionTurn | undefined =
      this.getTurnAtUnsafe(startTurn)
    if (!_.isUndefined(startGameTurn)) {
      startGameTurn = removeAdvanceTimeEvent(startGameTurn)
      if (!_.isUndefined(aiPlayer)) {
        startGameTurn = resetTurn(startGameTurn)
      }
    }

    const newTurns = await callAdvanceTurnsApi({
      setLoading: this.setLoading,
      setError: this.setError,
      startGameTurn,
      targetTurn,
      aiPlayer,
    })
    if (!_.isUndefined(newTurns)) {
      this.upsertTurns(newTurns)
      return true
    }
    return false
  }

  public async hireAgents(count: number): Promise<boolean> {
    const payloadProvider =
      playerActionsPayloadsProviders.HireAgentsPlayerAction
    const payload = payloadProvider(count)
    return this.applyPlayerAction(payload)
  }

  public async investIntel(
    factionId: number,
    amount: number,
  ): Promise<boolean> {
    const payloadProvider =
      playerActionsPayloadsProviders.InvestIntelPlayerAction
    const payload = payloadProvider([factionId], amount)
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
    const payloadProvider =
      playerActionsPayloadsProviders.BuyTransportCapacityPlayerAction
    const payload = payloadProvider(count)
    return this.applyPlayerAction(payload)
  }

  public async launchMission(
    agentsIds: number[],
    missionSiteId: number,
  ): Promise<boolean> {
    const payloadProvider =
      playerActionsPayloadsProviders.LaunchMissionPlayerAction
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
    if (this.getCurrentTurnNo() === initialTurn) {
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
    this.setSavedTurn(undefined)
    this.setError(undefined)
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
      this.getAssets().Money >=
        transportCapBuyingCost(this.getAssets().MaxTransportCapacity, 1)
    )
  }

  public getTurns(): readonly GameSessionTurn[] {
    return this.data.getTurns()
  }

  public getGameStates(): readonly GameState[] {
    return this.data.getGameStates()
  }

  public isInitialized(): boolean {
    return !_.isEmpty(this.data.getTurns())
  }

  public getTurnAtUnsafe(turn: number): GameSessionTurn | undefined {
    return this.data.getTurnAtUnsafe(turn)
  }

  public getCurrentTurn(): GameSessionTurn {
    return this.data.getCurrentTurn()
  }

  public getCurrentTurnNo(): number {
    return getTurnNo(this.data.getCurrentTurn())
  }

  public getCurrentTurnUnsafe(): GameSessionTurn | undefined {
    return this.data.getCurrentTurnUnsafe()
  }

  public getCurrentTurnNoUnsafe(): number | undefined {
    return getTurnNoUnsafe(this.data.getCurrentTurnUnsafe())
  }

  public getGameResultUnsafe(): GameResult | undefined {
    if (!this.isInitialized()) {
      return undefined
    }
    return this.getGameResult()
  }

  public getGameResult(): GameResult {
    const currentGameState = this.getCurrentGameState()
    return currentGameState.IsGameWon
      ? 'won'
      : currentGameState.IsGameLost
        ? 'lost'
        : 'undecided'
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
    const currentTurn = this.getCurrentTurn()
    return currentTurn.EndState.UpdateCount > currentTurn.StartState.UpdateCount
  }

  public canAdvanceTime(): boolean {
    const canAdvanceTime =
      !this.loading && (!this.isInitialized() || !this.isGameOver())
    return canAdvanceTime
  }

  public canDelegateTurnsToAi(): boolean {
    const canDelegateTurnsToAi =
      !this.loading && (!this.isInitialized() || !this.isGameOver())
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

  public getGameEvents(): readonly GameEventWithTurn[] {
    return this.data.getGameEvents()
  }

  public getCurrentGameState(): GameState {
    return this.data.getCurrentGameStateUnsafe()!
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.data.getCurrentGameStateUnsafe()
  }

  public upsertTurns(
    upsertedTurns: GameSessionTurn[],
    resultOfPlayerAction?: boolean,
  ): void {
    /* c8 ignore start */
    if (_.isEmpty(upsertedTurns)) {
      throw new Error('newTurns must not be empty')
    }
    if (this.isGameOverUnsafe() === true) {
      throw new Error('Cannot upsert turns to game that is over')
    }
    if (resultOfPlayerAction === true && !this.isInitialized()) {
      throw new Error(
        'The upserted turns cannot be result of player action when the game is not initialized.',
      )
    }
    if (resultOfPlayerAction === true && upsertedTurns.length !== 1) {
      throw new Error(
        'Exactly one turn must be upserted as a result of player action',
      )
    }
    /* c8 ignore stop */

    const firstUpsertedTurn = getTurnNo(upsertedTurns.at(0)!)
    const lastUpsertedTurn = upsertedTurns.at(-1)!.EndState.Timeline.CurrentTurn

    const retainedTurns = this.getRetainedTurns(firstUpsertedTurn)

    const firstRetainedTurn = getTurnNoUnsafe(retainedTurns.at(0))
    const lastRetainedTurn = getTurnNoUnsafe(retainedTurns.at(-1))

    console.log(
      `Upserting game session turns. ` +
        `currentTurn: ${this.getCurrentTurnNoUnsafe()}, ` +
        `firstUpsertedTurn: ${firstUpsertedTurn}, ` +
        `retained turns: [ ${firstRetainedTurn} - ${lastRetainedTurn} ], ` +
        `upserted turns: [ ${firstUpsertedTurn} - ${lastUpsertedTurn} ]`,
    )

    const turnsAfterUpsertion = [...retainedTurns, ...upsertedTurns]
    try {
      this.data.setTurns(turnsAfterUpsertion)
      this.setError(undefined)
    } catch (error: unknown) {
      this.setError((error as Error).message)
    }
  }

  public save(): void {
    this.data.save()
    this.setSavedTurn(this.getCurrentTurnNoUnsafe())
  }

  public getSize(): number {
    return this.data.getSize()
  }

  public getSaveOnExitEnabled(): boolean {
    return this.data.getSaveOnExitEnabled()
  }

  public getCompressionEnabled(): boolean {
    return this.data.getCompressionEnabled()
  }

  private async applyPlayerAction(
    playerActionPayload: PlayerActionPayload,
  ): Promise<boolean> {
    const currentGameTurn = this.getCurrentTurn()
    const newTurn: GameSessionTurn | undefined = await callApplyPlayerActionApi(
      {
        setLoading: this.setLoading,
        setError: this.setError,
        currentGameTurn,
        playerActionPayload,
      },
    )
    if (!_.isUndefined(newTurn)) {
      this.upsertTurns([newTurn], true)
      return true
    }
    return false
  }

  private getRetainedTurns(firstUpsertedTurn: number): GameSessionTurn[] {
    return _.takeWhile(
      this.getTurns(),
      (turn) => getTurnNo(turn) < firstUpsertedTurn,
    )
  }
}
