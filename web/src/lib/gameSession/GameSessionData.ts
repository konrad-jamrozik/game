/* eslint-disable sonarjs/no-inverted-boolean-check */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { initialTurn, type GameState } from '../codesync/GameState'
import type { StoredData } from '../storedData/StoredData'
import type { RenderedGameEvent } from './RenderedGameEvent'

export type GameSessionDataType = {
  readonly gameStates: readonly GameState[]
  readonly gameEvents: readonly RenderedGameEvent[]
}

export const initialGameSessionData: GameSessionDataType = {
  gameStates: [],
  gameEvents: [],
}

export class GameSessionData {
  public constructor(
    private readonly storedData: StoredData,
    private _data: GameSessionDataType,
    private readonly _setData: React.Dispatch<
      React.SetStateAction<GameSessionDataType>
    >,
  ) {}

  private static verify(gameStates: readonly GameState[]): void {
    /* c8 ignore start */
    if (_.isEmpty(gameStates)) {
      throw new Error('gameStates must not be empty')
    }
    const firstTurn = gameStates.at(0)!.Timeline.CurrentTurn
    if (firstTurn !== initialTurn) {
      throw new Error(`first turn must be initialTurn of ${initialTurn}`)
    }
    // eslint-disable-next-line lodash/collection-method-value
    _.reduce(
      gameStates,
      (currGs, nextGs) => {
        const currTurn = currGs.Timeline.CurrentTurn
        const nextTurn = nextGs.Timeline.CurrentTurn
        if (!(currTurn <= nextTurn && nextTurn <= currTurn + 1)) {
          throw new Error('gameStates turns must increment by 0 or 1')
        }
        if (
          /* The 'currTurn !== initialTurn' check is needed to because of the
          initial accumulator value the currGs and nextGs will be the same state at first. */
          currTurn !== initialTurn &&
          currTurn === nextTurn &&
          !(currGs.UpdateCount < nextGs.UpdateCount)
        ) {
          throw new Error(
            'If there are 2 game states with the same turn, the later state must have higher UpdateCount',
          )
        }
        return nextGs
      },
      gameStates[0]!,
    )
    const gssByCurrentTurn = _.groupBy(
      gameStates,
      (gs) => gs.Timeline.CurrentTurn,
    )
    const maxOccurrencesOfAnyTurn = _.maxBy(
      _.values(gssByCurrentTurn),
      (gss) => gss.length,
    )!.length
    if (!(maxOccurrencesOfAnyTurn <= 2)) {
      throw new Error(
        'There can be no more than two gameStates with given currentTurn',
      )
    }
    /* c8 ignore stop */
  }

  public getGameStates(): readonly GameState[] {
    return this._data.gameStates
  }

  public getGameEvents(): readonly RenderedGameEvent[] {
    return this._data.gameEvents
  }

  public getCurrentTurn(): number {
    return this.getCurrentGameState().Timeline.CurrentTurn
  }

  public getCurrentGameState(): GameState {
    return this.getCurrentGameStateUnsafe()!
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.getGameStates().at(-1)
  }

  public revertToPreviousTurn(): void {
    const newGameSessionData: GameSessionDataType = {
      gameStates: this.getGameStatesUntilCurrentTurnStart().slice(0, -1),
      gameEvents: this.getEventsUntilPreviousTurn(),
    }
    this.setData(newGameSessionData)
  }

  public getGameStateAtCurrentTurnStart(): GameState {
    return this.getGameStatesUntilCurrentTurnStart().at(-1)!
  }

  public getGameStatesUntilCurrentTurnStart(): GameState[] {
    const currentTurn = this.getCurrentTurn()
    const sliceEnd =
      this.getGameStates().length >= 2 &&
      this.getGameStates().at(-2)!.Timeline.CurrentTurn === currentTurn
        ? -1
        : undefined
    return this.getGameStates().slice(0, sliceEnd)
  }

  public getEventsUntilPreviousTurn(): RenderedGameEvent[] {
    const currentTurn = this.getCurrentTurn()
    return _.filter(
      this.getGameEvents(),
      (event: RenderedGameEvent) => event.Turn < currentTurn,
    )
  }

  public resetCurrentTurn(): void {
    const newGameSessionData: GameSessionDataType = {
      gameStates: this.getGameStatesUntilCurrentTurnStart(),
      gameEvents: this.getEventsUntilPreviousTurn(),
    }
    this.setData(newGameSessionData)
  }

  public setGameStates(gameStates: GameState[]): void {
    GameSessionData.verify(gameStates)
    const newData: GameSessionDataType = {
      ...this._data,
      gameStates,
    }

    this.setData(newData)
  }

  public setGameEvents(gameEvents: RenderedGameEvent[]): void {
    // future work: add here GameSessionData.verify(gameEvents)
    // GameSessionData.verify(gameEvents)
    const newData: GameSessionDataType = {
      ...this._data,
      gameEvents,
    }
    this.setData(newData)
  }

  public resetData(): void {
    this.storedData.resetGameSessionData()
    this._setData(initialGameSessionData)
  }

  private setData(data: GameSessionDataType): void {
    this.storedData.persistGameSessionData(data)
    this._setData(data)
    this._data = data
  }
}

// future work: Consider for later: using a reducer to manage game sates:
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// using immer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
