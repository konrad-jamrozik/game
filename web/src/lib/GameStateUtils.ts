import _ from 'lodash'
import type { GameState } from './GameState'

export function getGameResult(gameStates: readonly GameState[]): gameResult {
  const lastGameState = getCurrentState(gameStates)
  return lastGameState.IsGameWon
    ? 'won'
    : lastGameState.IsGameLost
      ? 'lost'
      : 'undecided'
}

export function getCurrentState(gameStates: readonly GameState[]): GameState {
  return gameStates.at(-1)!
}

export function getStateAtTurn(
  gameStates: readonly GameState[],
  turn: number,
): GameState {
  return _.findLast(gameStates, (gs) => gs.Timeline.CurrentTurn === turn)!
}

export function getCurrentTurn(gameStates: readonly GameState[]): number {
  return getCurrentState(gameStates).Timeline.CurrentTurn
}

export function isGameOver(gameStates: readonly GameState[]): boolean {
  const lastGameState = getCurrentState(gameStates)
  return lastGameState.IsGameOver
}

export type gameResult = 'won' | 'lost' | 'undecided'
