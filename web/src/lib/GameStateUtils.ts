import type { GameState } from '../types/GameState'

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

export function getCurrentTurn(gameStates: readonly GameState[]): number {
  return getCurrentState(gameStates).Timeline.CurrentTurn
}

export type gameResult = 'won' | 'lost' | 'undecided'
