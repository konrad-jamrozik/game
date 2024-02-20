/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { GameSessionContext } from '../components/GameSessionProvider'
import {
  type GameSessionData,
  GameSessionDataWrapper,
  initialGameSessionData,
} from './GameSessionData'
import { callAdvanceTurnsApi } from './api/advanceTurnsApi'
import { callApplyPlayerActionApi } from './api/applyPlayerActionApi'
import { getPlayerActionPayload } from './api/getPlayerActionPayload'
import { initialTurn, type GameState, type Assets } from './codesync/GameState'
import type { PlayerActionName } from './codesync/PlayerActionPayload'
import { agentHireCost, transportCapBuyingCost } from './codesync/ruleset'

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

  return new GameSession(
    new GameSessionDataWrapper(data, setData),
    loading,
    setLoading,
    error,
    setError,
  )
}

export class GameSession {
  public constructor(
    private readonly data: GameSessionDataWrapper,

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
  ): Promise<void> {
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
    }
  }

  public async applyPlayerAction(
    playerActionName: PlayerActionName,
    ids?: number[] | undefined,
    targetId?: number | undefined,
  ): Promise<boolean> {
    const currentGameState = this.getCurrentGameState()
    const newGameState = await callApplyPlayerActionApi({
      setLoading: this.setLoading,
      setError: this.setError,
      currentGameState,
      playerActionPayload: getPlayerActionPayload(
        playerActionName,
        ids,
        targetId,
      ),
    })

    if (!_.isUndefined(newGameState)) {
      this.upsertGameStates([newGameState])
      return true
    }
    return false
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

  public isLoaded(): boolean {
    return !_.isEmpty(this.data.getGameStates())
  }

  public getCurrentTurn(): number {
    return this.getCurrentGameState().Timeline.CurrentTurn
  }

  public getCurrentTurnUnsafe(): number | undefined {
    return this.getCurrentGameStateUnsafe()?.Timeline.CurrentTurn
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

  public isGameOver(): boolean {
    return this.getCurrentGameState().IsGameOver
  }

  public getPlayerMadeActionsInCurrentTurn(): boolean {
    return (
      this.isLoaded() &&
      this.data.getGameStates().at(-1)!.UpdateCount >
        this.data.getResetGameState()!.UpdateCount
    )
  }

  public canAdvanceTime(): boolean {
    return !this.isLoaded() || (!this.isGameOver() && !this.loading)
  }

  public canDelegateTurnsToAi(): boolean {
    return (
      !this.isLoaded() ||
      (!this.isGameOver() &&
        !this.loading &&
        !this.getPlayerMadeActionsInCurrentTurn())
    )
  }

  public isInProgress(): boolean {
    return this.isLoaded() && !this.isGameOver()
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
    this.data.setDataStates(gameStatesAfterUpsertion)
    this.setLoading(false)
    this.setError('')
  }
}

export type GameResult = 'won' | 'lost' | 'undecided'
