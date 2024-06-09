/* eslint-disable max-statements */
/* eslint-disable sonarjs/no-inverted-boolean-check */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import type { GameEvent } from '../codesync/GameEvent'
import {
  getEvents,
  getGameEvents,
  removeAdvanceTimeEvent,
  resetTurn,
  type GameSessionTurn,
} from '../codesync/GameSessionTurn'
import { initialTurn, type GameState } from '../codesync/GameState'
import type { StoredData } from '../storedData/StoredData'
import type { RenderedGameEvent } from './RenderedGameEvent'

export type GameSessionDataType = {
  readonly turns: readonly GameSessionTurn[]
}

export const initialGameSessionData: GameSessionDataType = {
  turns: [],
}

export class GameSessionData {
  public constructor(
    private readonly storedData: StoredData,
    private _data: GameSessionDataType,
    private readonly _setData: React.Dispatch<
      React.SetStateAction<GameSessionDataType>
    >,
  ) {}

  private static verify(turns: readonly GameSessionTurn[]): void {
    /* c8 ignore start */
    if (_.isEmpty(turns)) {
      throw new Error('Turns must not be empty')
    }
    const firstTurnNo = turns.at(0)!.StartState.Timeline.CurrentTurn
    if (firstTurnNo !== initialTurn) {
      throw new Error(`First turn must be initialTurn of ${initialTurn}`)
    }

    if (turns.at(0)!.EventsUntilStartState.length > 0) {
      throw new Error('EventsUntilStartState must be empty for first turn')
    }

    for (const turn of turns.slice(0, -1)) {
      if (_.isUndefined(turn.AdvanceTimeEvent)) {
        throw new TypeError(
          'AdvanceTimeEvent must not be nil for all but first turn',
        )
      }
    }

    for (const turn of turns) {
      if (
        !(
          turn.StartState.Timeline.CurrentTurn ===
          turn.EndState.Timeline.CurrentTurn
        )
      ) {
        throw new Error(
          'All game states in any given turn must have the same turn number',
        )
      }
      if (!(turn.EndState.UpdateCount >= turn.StartState.UpdateCount)) {
        throw new Error(
          'End state must have same or more updates than start state.',
        )
      }
      if (
        !(
          turn.EventsInTurn.length ===
          turn.EndState.UpdateCount - turn.StartState.UpdateCount
        )
      ) {
        throw new Error(
          'The number of events in turn must match the number of update count between start and end state.',
        )
      }
    }
    // eslint-disable-next-line lodash/collection-method-value
    _.reduce(
      turns.slice(1),
      (currTurn, nextTurn) => {
        const currTurnNo = currTurn.StartState.Timeline.CurrentTurn
        const nextTurnNo = nextTurn.StartState.Timeline.CurrentTurn
        if (!(nextTurnNo === currTurnNo + 1)) {
          throw new Error('Turn numbers must be consecutive')
        }
        return nextTurn
      },
      turns.at(0)!,
    )

    const gameEvents: readonly GameEvent[] = getGameEvents(turns)
    if (!_.isEmpty(gameEvents)) {
      const firstEventId = gameEvents.at(0)!.Id
      for (const eventIndex of _.range(1, gameEvents.length)) {
        const event = gameEvents[eventIndex]!
        if (event.Id !== firstEventId + eventIndex) {
          throw new Error('Event IDs must be consecutive')
        }
      }
    }

    /* c8 ignore stop */
  }

  public getTurns(): readonly GameSessionTurn[] {
    return this._data.turns
  }

  public getCurrentTurn(): GameSessionTurn {
    return this.getCurrentTurnUnsafe()!
  }

  public getTurnAtUnsafe(turn: number): GameSessionTurn | undefined {
    return _.find(
      this._data.turns,
      (gameTurn) => gameTurn.StartState.Timeline.CurrentTurn === turn,
    )
  }

  public getCurrentTurnUnsafe(): GameSessionTurn | undefined {
    return this.getTurns().at(-1)
  }

  // kja all usages of this should be unnecessary
  public getGameStates(): readonly GameState[] {
    return _.flatMap(this._data.turns, (turn) => [
      turn.StartState,
      turn.EndState,
    ])
  }

  public getRenderedGameEvents(): readonly RenderedGameEvent[] {
    return _.flatMap(this.getTurns(), (turn) => {
      const eventsInThisTurn = getEvents(turn)
      const renderedEventsInThisTurn = _.map(eventsInThisTurn, (event) => ({
        Id: event.Id,
        Turn: turn.StartState.Timeline.CurrentTurn,
        Type: event.Type,
        Details: event.Details,
      }))
      return renderedEventsInThisTurn
    })
  }

  public getCurrentGameState(): GameState {
    return this.getCurrentGameStateUnsafe()!
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.getGameStates().at(-1)
  }

  public revertToPreviousTurn(): void {
    const turnsBeforeCurrentTurn = this.getTurnsBeforeCurrentTurn()
    const turnBeforeCurrentTurn = removeAdvanceTimeEvent(
      turnsBeforeCurrentTurn.at(-1)!,
    )
    const newData: GameSessionDataType = {
      turns: [...turnsBeforeCurrentTurn.slice(0, -1), turnBeforeCurrentTurn],
    }
    this.setData(newData)
  }

  public resetCurrentTurn(): void {
    const currentTurn: GameSessionTurn = this.getCurrentTurn()
    const currentTurnAfterReset: GameSessionTurn = resetTurn(currentTurn)

    const newData: GameSessionDataType = {
      turns: [...this.getTurnsBeforeCurrentTurn(), currentTurnAfterReset],
    }
    this.setData(newData)
  }

  public getTurnsBeforeCurrentTurn(): readonly GameSessionTurn[] {
    return this.getTurns().slice(0, -1)
  }

  public getGameStateAtCurrentTurnStart(): GameState {
    return this.getCurrentTurn().StartState
  }

  public setTurns(turns: readonly GameSessionTurn[]): void {
    GameSessionData.verify(turns)
    const newData: GameSessionDataType = {
      turns,
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
