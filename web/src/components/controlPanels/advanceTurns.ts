/* eslint-disable max-statements */
/* eslint-disable @typescript-eslint/init-declarations */
import _ from 'lodash'
import { initialTurn } from '../../lib/codesync/GameState'
import type { AIPlayerName } from '../../lib/codesync/aiPlayer'
import { startTiming } from '../../lib/dev'
import type { GameSession } from '../../lib/gameSession/GameSession'

// eslint-disable-next-line @typescript-eslint/max-params
export async function advanceTurns(
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
  setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>,
  turnsToAdvance?: number,
  aiPlayer?: AIPlayerName | undefined,
): Promise<void> {
  console.log(`Executing advanceTurns(). Resetting elapsed time.`)
  startTiming()
  const { resolvedStartTurn, resolvedTargetTurn } = resolveStartAndTargetTurn(
    startTurn,
    targetTurn,
    gameSession.getCurrentTurnNoUnsafe(),
    turnsToAdvance,
  )
  const turnAdvanced = await gameSession.advanceTurns(
    resolvedStartTurn,
    resolvedTargetTurn,
    aiPlayer,
  )
  if (turnAdvanced) {
    setTurnAdvanced(true)
  }
}

/**
 * This function determines an interval of [resolvedStartTurn, resolvedTargetTurn] based on following inputs:
 * - [startTurn, targetTurn] interval, selected in UI
 * - currentTurn of game session in progress, if any
 * - turnsToAdvance, selected in UI, if any
 */
function resolveStartAndTargetTurn(
  startTurn: number,
  targetTurn: number,
  currentTurn?: number,
  turnsToAdvance?: number,
): {
  resolvedStartTurn: number
  resolvedTargetTurn: number
} {
  const turnsToAdvanceDefined = !_.isUndefined(turnsToAdvance)
  const currentTurnDefined = !_.isUndefined(currentTurn)

  /* c8 ignore start */
  if (turnsToAdvanceDefined && turnsToAdvance !== 1) {
    throw new Error(
      `turnsToAdvance must be 1, if it's defined. It is instead ${turnsToAdvance}.`,
    )
  }
  /* c8 ignore stop */

  let resolvedStartTurn: number | undefined
  let resolvedTargetTurn: number | undefined

  // Case 1: If turnsToAdvance is not defined, then [startTurn, targetTurn] is used.
  // ---------------------------------------------------------------------------

  // Case 1.1: use turn range when there is no game session in progress.
  // If currentTurn is not defined, then the interval is [initialTurn, targetTurn].
  // This is because if currentTurn is not defined, then the game is not initialized,
  // hence we force the resolvedStartTurn to be initialTurn.
  if (!turnsToAdvanceDefined && !currentTurnDefined) {
    resolvedStartTurn = initialTurn
    resolvedTargetTurn = targetTurn
  }

  // Case 1.2: use turn range for game session in progress.
  // If startTurn is after currentTurn, then the turns are advanced from current turn,
  // otherwise there would be gap in the turns.
  // Hence the actual resolved interval is [min(startTurn, currentTurn), targetTurn].
  if (!turnsToAdvanceDefined && currentTurnDefined) {
    resolvedStartTurn = _.min([startTurn, currentTurn])!
    resolvedTargetTurn = targetTurn
  }

  // Case 2: If turnsToAdvance is defined, then [startTurn, targetTurn] is ignored.
  // ---------------------------------------------------------------------------

  // Case 2.1: use turn range for game session not in progress.
  // If currentTurn is not defined, the turns to advance start from initialTurn until initialTurn + turnsToAdvance - 1.
  // For example:
  // - if turnsToAdvance is 1, then the interval is [initialTurn, initialTurn]
  // - if turnsToAdvance is 3 and initialTurn is 1, then the interval is [1, 3].
  //
  // This code branch is a special case.
  //
  // Because currentTurn is not defined, we assume the game session is not initialized.
  // As a result, we are not advancing starting from initialTurn, but from "before" initialTurn (or "into" initialTurn),
  // to initialize the game session.
  // It is assumed here that the downstream code will interpret this special case correctly.
  if (turnsToAdvanceDefined && !currentTurnDefined) {
    resolvedStartTurn = initialTurn
    resolvedTargetTurn = initialTurn + turnsToAdvance - 1
  }

  // Case 2.2: use turn range for game session in progress.
  // If currentTurn is defined, the turns to advance start from currentTurn, and go until currentTurn + turnsToAdvance.
  // For example, if currentTurn is 8 and turnsToAdvance is 3, then the interval is [8, 11].
  if (turnsToAdvanceDefined && currentTurnDefined) {
    resolvedStartTurn = currentTurn
    resolvedTargetTurn = currentTurn + turnsToAdvance
  }

  /* c8 ignore start */
  if (_.isUndefined(resolvedStartTurn) || _.isUndefined(resolvedTargetTurn)) {
    throw new TypeError(`resolvedStartTurn or resolvedEndTurn is undefined.`)
  }
  /* c8 ignore stop */

  console.log(
    `resolveStartAndTargetTurn: ` +
      `currentTurn: ${currentTurn}, turnsToAdvance: ${turnsToAdvance}, ` +
      `[startTurn, targetTurn]: [${startTurn}, ${targetTurn}], ` +
      `resolved: [${resolvedStartTurn}, ${resolvedTargetTurn}]`,
  )
  return { resolvedStartTurn, resolvedTargetTurn }
}
