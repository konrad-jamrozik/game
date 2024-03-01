/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { initialTurn, type GameState } from './codesync/GameState'

export class GameSessionDataWrapper {
  public constructor(
    private readonly _data: GameSessionData,
    private readonly _setData: React.Dispatch<
      React.SetStateAction<GameSessionData>
    >,
  ) {}

  private static verify(gameStates: readonly GameState[]): void {
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
    const newGameSessionData: GameSessionData = {
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
    const newGameSessionData: GameSessionData = {
      gameStates: [...previousTurnsGameStates, this._data.resetGameState!],
      resetGameState: this._data.resetGameState,
    }
    this.setData(newGameSessionData)
  }

  public setDataStates(
    gameStates: GameState[],
    resultOfPlayerAction: boolean,
  ): void {
    GameSessionDataWrapper.verify(gameStates)
    const resetGameState = resultOfPlayerAction
      ? this._data.resetGameState
      : gameStates.at(-1)
    const newData: GameSessionData = {
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

  private setData(data: GameSessionData): void {
    localStorage.setItem('gameSessionData', JSON.stringify(data))
    this._setData(data)
  }
}

export type GameSessionData = {
  readonly gameStates: readonly GameState[]
  readonly resetGameState: GameState | undefined
}

export const initialGameSessionData: GameSessionData = {
  gameStates: [],
  /**
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
   */
  resetGameState: undefined,
}
// Consider for later:
// using a reducer to manage game sates:
// https://react.dev/learn/extracting-state-logic-into-a-reducer
// using immer:
// https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-concise-reducers-with-immer
