/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { initialTurn, type GameState } from '../codesync/GameState'
import type { StoredData } from '../storedData/StoredData'

export class GameSessionData {
  public constructor(
    private readonly storedData: StoredData,
    private readonly _data: GameSessionDataType,
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
    // Verify that CurrentTurn increments in all gameStates
    if (
      !_.every(
        gameStates,
        (gs, index) => gs.Timeline.CurrentTurn === firstTurn + index,
      )
    ) {
      throw new Error(
        'gameStates must have sequential turns, incrementing by 1',
      )
    }
    /* c8 ignore stop */
  }

  public getGameStates(): readonly GameState[] {
    return this._data.gameStates
  }

  public getResetGameState(): GameState {
    return this._data.resetGameState!
  }

  public revertToPreviousTurn(): void {
    const previousTurnsGameStates: GameState[] = this._data.gameStates.slice(
      0,
      -1,
    )
    const newGameSessionData: GameSessionDataType = {
      gameStates: previousTurnsGameStates,
      resetGameState: previousTurnsGameStates.at(-1),
    }
    this.setData(newGameSessionData)
  }

  public resetCurrentTurn(): void {
    const previousTurnsGameStates: GameState[] = this._data.gameStates.slice(
      0,
      -1,
    )
    const newGameSessionData: GameSessionDataType = {
      gameStates: [...previousTurnsGameStates, this._data.resetGameState!],
      resetGameState: this._data.resetGameState,
    }
    this.setData(newGameSessionData)
  }

  public setDataStates(
    gameStates: GameState[],
    resultOfPlayerAction: boolean,
  ): void {
    GameSessionData.verify(gameStates)
    const resetGameState = resultOfPlayerAction
      ? this._data.resetGameState
      : gameStates.at(-1)
    const newData: GameSessionDataType = {
      ...this._data,
      gameStates,
      resetGameState,
    }

    this.setData(newData)
  }

  public resetData(): void {
    localStorage.removeItem('gameSessionData')
    this._setData(initialGameSessionData)
  }

  private setData(data: GameSessionDataType): void {
    this.storedData.persistGameSessionData(data)
    this._setData(data)
  }
}

export type GameSessionDataType = {
  readonly gameStates: readonly GameState[]
  /**
   * // kja this should be called revertTurnState or something, not resetGame
   * The game state to which the current turn game state should be reset when
   * the 'reset turn' button is clicked.
   *
   * When the game session is not loaded, reset game state is undefined.
   * When the game session is loaded and the player never reverted or reset
   * current turn, then resetGameState points to the game state at the beginning
   * of current turn. This way resetting current turn will revert to the beginning
   * of current turn, before the player made any player actions.
   *
   * After player reverts the turn, resetGameState points to the game state
   * as it was at the end of the turn before the reverted turn, after all player actions.
   *
   * If one desires to reset the game to a the beginning of one of the previous turns,
   * one could revert to the turn before that and advance turn.
   *
   * Example:
   * Player is at turn 9. Player made player action of 'hire agent'; and then advanced time by 1 turn to turn 10.
   * Now resetGameState is at the beginning of turn 10. If now player makes a player action, like 'launch mission',
   * then resetting the turn to resetGameState will effectively move time backwards to the beginning of turn 10,
   * before 'launch mission' player action was made.
   *
   * If now player reverts the turn to turn 9, then resetGameState will point to the game state at the end of turn 9,
   * meaning after the player action of 'hire agent'. If the player would want to go back to the beginning of turn 9,
   * then the player can revert to turn 8 and advance turn, to effectively end up at the beginning of turn 9.
   *
   * // kja Change the behavior above. Reverting turn should revert to the end of previous turn, not beginning.
   * // Hence it will flip between Revert 1 turn / Reset turn / Revert 1 turn / Reset turn/
   * // Unless player made no actions given turn. Then reverting turn is effectively reverting to the beginning.
   * //
   * // One reason for this change is that it is not possible to revert to the beginning of turn 1 after turn 2.
   * // If one is in turn 2 and clicks "revert 1 turn" then it will revert to the end of turn 1 and instead
   * // of having enabled "reset turn" button the UI will have disabled "revert 1 turn".
   * //
   * // The way I can do it is by looking at turn number: first reset to first state with given turn number,
   * // then to last state with turnNo-1, then to first state with turnNo-1, then to last state with turnNo-2, and so on.
   */
  readonly resetGameState: GameState | undefined
}

export const initialGameSessionData: GameSessionDataType = {
  gameStates: [],
  resetGameState: undefined,
}
// Future work: Consider for later:
// using a reducer to manage game sates:
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// using immer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
