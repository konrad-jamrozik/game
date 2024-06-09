/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { Md5 } from 'ts-md5'
import { GameSessionContext } from '../../components/GameSessionProvider'
import { callAdvanceTurnsApi } from '../api/advanceTurnsApi'
import { callApplyPlayerActionApi } from '../api/applyPlayerActionApi'
import { playerActionsPayloadsProviders } from '../api/playerActionsPayloadsProviders'
import type { GameEvent } from '../codesync/GameEvent'
import {
  removeAdvanceTimeEvent,
  resetTurn,
  type GameSessionTurn,
} from '../codesync/GameSessionTurn'
import { initialTurn, type Assets, type GameState } from '../codesync/GameState'
import type {
  AgentPlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'
import { agentHireCost, transportCapBuyingCost } from '../codesync/ruleset'
import type { StoredData } from '../storedData/StoredData'
import {
  GameSessionData,
  initialGameSessionData,
  type GameSessionDataType,
} from './GameSessionData'
import type { RenderedGameEvent } from './RenderedGameEvent'

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
    let startGameTurn: GameSessionTurn | undefined =
      this.getTurnAtUnsafe(startTurn)
    if (!_.isUndefined(startGameTurn)) {
      startGameTurn = removeAdvanceTimeEvent(startGameTurn)
      if (delegateToAi ?? true) {
        startGameTurn = resetTurn(startGameTurn)
      }
    }

    const newTurns = await callAdvanceTurnsApi({
      setLoading: this.setLoading,
      setError: this.setError,
      startGameTurn,
      targetTurn,
      delegateToAi,
    })
    if (!_.isUndefined(newTurns)) {
      this.upsertTurns(newTurns)
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
    if (this.getCurrentTurn().StartState.Timeline.CurrentTurn === initialTurn) {
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

  public getTurns(): readonly GameSessionTurn[] {
    return this.data.getTurns()
  }

  public getGameStates(): readonly GameState[] {
    return this.data.getGameStates()
  }

  public isInitialized(): boolean {
    return !_.isEmpty(this.data.getGameStates())
  }

  public getTurnAtUnsafe(turn: number): GameSessionTurn | undefined {
    return this.data.getTurnAtUnsafe(turn)
  }

  public getCurrentTurn(): GameSessionTurn {
    return this.data.getCurrentTurn()
  }

  public getCurrentTurnUnsafe(): GameSessionTurn | undefined {
    return this.data.getCurrentTurnUnsafe()
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

  public getRenderedGameEvents(): readonly RenderedGameEvent[] {
    return this.data.getRenderedGameEvents()
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

    const firstUpsertedTurn =
      upsertedTurns.at(0)!.StartState.Timeline.CurrentTurn
    const lastUpsertedTurn = upsertedTurns.at(-1)!.EndState.Timeline.CurrentTurn

    const retainedTurns = this.getRetainedTurns(firstUpsertedTurn)

    const firstRetainedTurn =
      retainedTurns.at(0)?.StartState.Timeline.CurrentTurn
    const lastRetainedTurn =
      retainedTurns.at(-1)?.StartState.Timeline.CurrentTurn

    console.log(
      `Upserting game session turns. ` +
        `currentTurn: ${this.getCurrentTurnUnsafe()?.StartState.Timeline.CurrentTurn}, ` +
        `firstUpsertedTurn: ${firstUpsertedTurn}, ` +
        `retained turns: [ ${firstRetainedTurn} - ${lastRetainedTurn} ], ` +
        `upserted turns: [ ${firstUpsertedTurn} - ${lastUpsertedTurn} ]`,
    )

    const turnsAfterUpsertion = [...retainedTurns, ...upsertedTurns]
    this.data.setTurns(turnsAfterUpsertion)
    this.setLoading(false)
    this.setError('')
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
      (turn) => turn.StartState.Timeline.CurrentTurn < firstUpsertedTurn,
    )
  }
}
