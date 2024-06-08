/* eslint-disable sonarjs/no-inverted-boolean-check */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import type { GameEvent } from '../codesync/GameEvent'
import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import type { GameState } from '../codesync/GameState'
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

  public getTurns(): readonly GameSessionTurn[] {
    return this._data.turns
  }

  public getCurrentTurn(): GameSessionTurn {
    return this.getCurrentTurnUnsafe()!
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

  public getGameEvents(): readonly GameEvent[] {
    return _.flatMap(this._data.turns, (turn) => [
      ...turn.EventsUntilStartState,
      ...turn.EventsInTurn,
    ])
  }

  // kja refactor getRenderedGameEvents. Event ID and turn should be returned from the backend
  public getRenderedGameEvents(): readonly RenderedGameEvent[] {
    let eventId = 0
    return _.reduce(
      this._data.turns,
      (acc: RenderedGameEvent[], turn: GameSessionTurn) => {
        const eventsInThisTurn = [
          ...turn.EventsUntilStartState,
          ...turn.EventsInTurn,
        ]

        const renderedEventsInThisTurn: RenderedGameEvent[] = _.map(
          eventsInThisTurn,
          (event) => ({
            // eslint-disable-next-line no-plusplus
            Id: eventId++,
            Turn: turn.StartState.Timeline.CurrentTurn,
            Type: event.Type,
            Details: event.Details,
          }),
        )

        return [...acc, ...renderedEventsInThisTurn]
      },
      [] as RenderedGameEvent[],
    )
  }

  public getCurrentGameState(): GameState {
    return this.getCurrentGameStateUnsafe()!
  }

  public getCurrentGameStateUnsafe(): GameState | undefined {
    return this.getGameStates().at(-1)
  }

  public revertToPreviousTurn(): void {
    const newData: GameSessionDataType = {
      turns: this.getTurnsBeforeCurrentTurn(),
    }
    this.setData(newData)
  }

  public resetCurrentTurn(): void {
    const currentTurn: GameSessionTurn = this.getCurrentTurn()
    const currentTurnAfterReset: GameSessionTurn = {
      EventsUntilStartState: currentTurn.EventsUntilStartState,
      StartState: currentTurn.StartState, // kja deep clone?
      EventsInTurn: [],
      EndState: currentTurn.StartState, // kja deep clone?
    }

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
    // kja
    // GameSessionData.verify(turns)
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

// kja to adapt
// private static verify(gameStates: readonly GameState[]): void {
//   /* c8 ignore start */
//   if (_.isEmpty(gameStates)) {
//     throw new Error('gameStates must not be empty')
//   }
//   const firstTurn = gameStates.at(0)!.Timeline.CurrentTurn
//   if (firstTurn !== initialTurn) {
//     throw new Error(`first turn must be initialTurn of ${initialTurn}`)
//   }
//   // eslint-disable-next-line lodash/collection-method-value
//   _.reduce(
//     gameStates,
//     (currGs, nextGs) => {
//       const currTurn = currGs.Timeline.CurrentTurn
//       const nextTurn = nextGs.Timeline.CurrentTurn
//       if (!(currTurn <= nextTurn && nextTurn <= currTurn + 1)) {
//         throw new Error('gameStates turns must increment by 0 or 1')
//       }
//       if (
//         /* The 'currTurn !== initialTurn' check is needed to because of the
//         initial accumulator value the currGs and nextGs will be the same state at first. */
//         currTurn !== initialTurn &&
//         currTurn === nextTurn &&
//         !(currGs.UpdateCount < nextGs.UpdateCount)
//       ) {
//         throw new Error(
//           'If there are 2 game states with the same turn, the later state must have higher UpdateCount',
//         )
//       }
//       return nextGs
//     },
//     gameStates[0]!,
//   )
//   const gssByCurrentTurn = _.groupBy(
//     gameStates,
//     (gs) => gs.Timeline.CurrentTurn,
//   )
//   const maxOccurrencesOfAnyTurn = _.maxBy(
//     _.values(gssByCurrentTurn),
//     (gss) => gss.length,
//   )!.length
//   if (!(maxOccurrencesOfAnyTurn <= 2)) {
//     throw new Error(
//       'There can be no more than two gameStates with given currentTurn',
//     )
//   }
//   /* c8 ignore stop */
// }
