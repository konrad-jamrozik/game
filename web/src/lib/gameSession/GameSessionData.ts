/* eslint-disable max-statements */
/* eslint-disable sonarjs/no-inverted-boolean-check */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import {
  addTurnToGameEvent,
  type GameEvent,
  type GameEventWithTurn,
} from '../codesync/GameEvent'
import {
  getEvents,
  getGameEvents,
  getTurnNo,
  removeAdvanceTimeEvent,
  resetTurn,
  type GameSessionTurn,
} from '../codesync/GameSessionTurn'
import { initialTurn, type GameState } from '../codesync/GameState'
import type { StoredData } from '../storedData/StoredData'

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
    const firstTurnNo = getTurnNo(turns.at(0)!)
    if (firstTurnNo !== initialTurn) {
      throw new Error(`First turn must be initialTurn of ${initialTurn}`)
    }

    for (const turn of turns.slice(0, -1)) {
      if (_.isUndefined(turn.AdvanceTimeEvent)) {
        throw new TypeError(
          'AdvanceTimeEvent must not be nil for all but first turn',
        )
      }
    }

    for (const [index, turn] of turns.entries()) {
      if (
        _.isEmpty(turn.EventsUntilStartState) ||
        turn.EventsUntilStartState.at(-1)?.Type !== 'ReportEvent'
      ) {
        throw new Error(
          `Last world event of any game turn must be ReportEvent. Turn index: ${index}`,
        )
      }
      if (
        !(
          turn.StartState.Timeline.CurrentTurn ===
          turn.EndState.Timeline.CurrentTurn
        )
      ) {
        throw new Error(
          `All game states in any given turn must have the same turn number. Turn index: ${index}`,
        )
      }
      if (!(turn.EndState.UpdateCount >= turn.StartState.UpdateCount)) {
        throw new Error(
          `End state must have same or more updates than start state. Turn index: ${index}`,
        )
      }
      if (
        !(
          turn.EventsInTurn.length ===
          turn.EndState.UpdateCount - turn.StartState.UpdateCount
        )
      ) {
        throw new Error(
          `The number of events in turn must match the number of update count between start and end state. Turn index: ${index}`,
        )
      }
    }
    // eslint-disable-next-line lodash/collection-method-value
    _.reduce(
      turns.slice(1),
      (currTurn, nextTurn) => {
        const currTurnNo = getTurnNo(currTurn)
        const nextTurnNo = getTurnNo(nextTurn)
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

  public getTurnAtUnsafe(turnToFind: number): GameSessionTurn | undefined {
    return _.find(
      this._data.turns,
      (gameTurn) => getTurnNo(gameTurn) === turnToFind,
    )
  }

  public getCurrentTurnUnsafe(): GameSessionTurn | undefined {
    return this.getTurns().at(-1)
  }

  public getGameStates(): readonly GameState[] {
    return _.flatMap(this._data.turns, (turn) => [
      turn.StartState,
      turn.EndState,
    ])
  }

  public getGameEvents(): readonly GameEventWithTurn[] {
    return _.flatMap(this.getTurns(), (turn) => {
      const eventsInThisTurn = getEvents(turn)
      const renderedEventsInThisTurn = _.map(eventsInThisTurn, (event) =>
        addTurnToGameEvent(event, turn),
      )
      return renderedEventsInThisTurn
    })
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.getCurrentTurnUnsafe()?.EndState
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
    const newData: GameSessionDataType = {
      turns,
    }
    this.setData(newData)
  }

  public resetData(): void {
    this.storedData.resetGameSessionData()
    this._setData(initialGameSessionData)
  }

  public persistOnExit(): void {
    console.log('GameSessionData.persistOnExit()')
    this.storedData.persistGameSessionData(this._data)
  }

  public getSize(): number {
    return JSON.stringify(this._data).length
  }

  private setData(data: GameSessionDataType): void {
    GameSessionData.verify(data.turns)
    // Uncomment to persist game session data on every update.
    // Now it is persisted only on exit.
    // this.storedData.persistGameSessionData(data)
    this._setData(data)
    // kja is this necessary?
    this._data = data
  }
}

// future work: Consider for later: using a reducer to manage game sates:
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// using immer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
