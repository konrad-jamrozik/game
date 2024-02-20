/* eslint-disable max-lines */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import type { GameSession } from '../../lib/GameSession'
import { initialTurn } from '../../lib/GameState'
import { Label } from '../Label'

export type GameSessionControlPanelProps = {
  readonly gameSession: GameSession
}

const defaultStartTurn = 1
const defaultTargetTurn = 120

export function GameSessionControlPanel(
  props: GameSessionControlPanelProps,
): React.JSX.Element {
  const [startTurn, setStartTurn] = useState<number>(defaultStartTurn)
  const [targetTurn, setTargetTurn] = useState<number>(defaultTargetTurn)

  function gameRunMsg(): string {
    return `Game ran until turn ${props.gameSession.getCurrentTurn()}. Result: ${props.gameSession.getGameResult()}`
  }

  async function advanceTurns(
    turnsToAdvance?: number,
    delegateToAi?: boolean,
  ): Promise<void> {
    const { resolvedStartTurn, resolvedTargetTurn } = resolveStartAndTargetTurn(
      startTurn,
      targetTurn,
      props.gameSession.getCurrentTurnUnsafe(),
      turnsToAdvance,
    )
    await props.gameSession.advanceTurns(
      resolvedStartTurn,
      resolvedTargetTurn,
      delegateToAi,
    )
  }

  const theme = useTheme()
  const smallDisplay = useMediaQuery(theme.breakpoints.down('sm'))
  const textFieldWidth = smallDisplay ? 64 : 90

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 440,
        width: '100%',
      }}
    >
      <CardHeader title="Game Session" sx={{ paddingBottom: '0px' }} />
      <CardContent sx={{ padding: '14px' }}>
        <Grid container spacing={1}>
          <Grid xs={12}>
            <Label>{currentTurnLabel(props.gameSession)}</Label>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {advanceTimeBy1TurnButton(advanceTurns, props.gameSession)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {resetCurrentTurnButton(props.gameSession)}
            </Grid>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {delegate1TurnToAiButton(advanceTurns, props.gameSession)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {wipeGameSessionButton(props.gameSession)}
            </Grid>
          </Grid>

          <Grid>
            {delegateTurnsToAiButton(
              advanceTurns,
              props.gameSession,
              startTurn,
              targetTurn,
            )}
          </Grid>
          <Grid container xsOffset={'auto'}>
            <Grid>
              {startTurnInputTextField(startTurn, setStartTurn, textFieldWidth)}
            </Grid>
            <Grid>
              {targetTurnInputTextField(
                targetTurn,
                setTargetTurn,
                textFieldWidth,
              )}
            </Grid>
          </Grid>
          {props.gameSession.isLoaded() && (
            <Grid xs={12}>
              <Label>{gameRunMsg()}</Label>
            </Grid>
          )}
          {Boolean(props.gameSession.error) && (
            <Grid xs={12}>Error: {props.gameSession.error}</Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

function currentTurnLabel(gameSession: GameSession): string {
  return `Current turn: ${gameSession.getCurrentTurnUnsafe() ?? 'N/A'}`
}

function startTurnInputTextField(
  startTurn: number,
  setStartTurn: React.Dispatch<React.SetStateAction<number>>,
  width: number,
): React.JSX.Element {
  return (
    <TextField
      sx={{ width }}
      id="textfield-start-turn"
      label="start"
      type="number"
      value={startTurn}
      onChange={(event: React.ChangeEvent) => {
        const target = event.target as HTMLInputElement
        setStartTurn(target.valueAsNumber)
      }}
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        min: 1,
        max: 300,
        step: 1,
      }}
    />
  )
}

function targetTurnInputTextField(
  targetTurn: number,
  setTargetTurn: React.Dispatch<React.SetStateAction<number>>,
  width: number,
): React.JSX.Element {
  return (
    <TextField
      sx={{ width }}
      id="textfield-target-turn"
      label="target"
      type="number"
      value={targetTurn}
      onChange={(event: React.ChangeEvent) => {
        const target = event.target as HTMLInputElement
        setTargetTurn(target.valueAsNumber)
      }}
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        min: 1,
        max: 300,
        step: 1,
      }}
    />
  )
}

function advanceTimeBy1TurnButton(
  advanceTurns: (
    turnsToAdvance?: number,
    delegateToAi?: boolean,
  ) => Promise<void>,
  gameSession: GameSession,
): React.JSX.Element {
  return (
    <Button
      variant="contained"
      onClick={async () => advanceTurns(1, false)}
      disabled={!gameSession.canAdvanceTime()}
    >
      {'Advance 1 turn'}
    </Button>
  )
}

function delegate1TurnToAiButton(
  advanceTurns: (
    turnsToAdvance?: number,
    delegateToAi?: boolean,
  ) => Promise<void>,
  gameSession: GameSession,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => advanceTurns(1, true)}
      disabled={!gameSession.canDelegateTurnsToAi()}
    >
      {'Delegate 1 turn to AI'}
    </Button>
  )
}

function delegateTurnsToAiButton(
  advanceTurns: (
    turnsToAdvance?: number,
    delegateToAi?: boolean,
  ) => Promise<void>,
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => advanceTurns(undefined, true)}
      disabled={!gameSession.canDelegateTurnsToAi() || startTurn >= targetTurn}
    >
      {`Delegate turns to AI:`}
    </Button>
  )
}

function resetCurrentTurnButton(gameSession: GameSession): React.JSX.Element {
  const playerMadeActions = gameSession.getPlayerMadeActionsInCurrentTurn()
  const isDisabled =
    !gameSession.isLoaded() ||
    gameSession.loading ||
    (gameSession.getCurrentTurn() === initialTurn && !playerMadeActions)

  const label =
    playerMadeActions || !gameSession.isLoaded()
      ? `Reset turn`
      : `Revert 1 turn`

  function reset(): void {
    if (playerMadeActions) {
      gameSession.resetCurrentTurn()
    } else {
      gameSession.revertToPreviousTurn()
    }
  }

  return (
    <Button
      variant="outlined"
      onClick={reset}
      disabled={isDisabled}
      color="warning"
    >
      {label}
    </Button>
  )
}

function wipeGameSessionButton(gameSession: GameSession): React.JSX.Element {
  function wipe(): void {
    gameSession.wipe()
  }

  return (
    <Button
      variant="outlined"
      onClick={wipe}
      disabled={!gameSession.isLoaded() || gameSession.loading}
      color="error"
    >
      {`Wipe game`}
    </Button>
  )
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

  // Case 1: If turnsToAdvance is not defined, then [startTurn, targetTurn] is used.
  // ---------------------------------------------------------------------------

  // If currentTurn is not defined, then the interval is [startTurn, targetTurn].
  if (!turnsToAdvanceDefined && !currentTurnDefined) {
    return {
      resolvedStartTurn: startTurn,
      resolvedTargetTurn: targetTurn,
    }
  }

  // If startTurn is after currentTurn, then the turns are advanced from current turn,
  // otherwise there would be gap in the turns.
  // Hence the actual resolved interval is [min(startTurn, currentTurn), targetTurn].
  if (!turnsToAdvanceDefined && currentTurnDefined) {
    return {
      resolvedStartTurn: _.min([startTurn, currentTurn])!,
      resolvedTargetTurn: targetTurn,
    }
  }

  // Case 2: If turnsToAdvance is defined, then [startTurn, targetTurn] is ignored.
  // ---------------------------------------------------------------------------

  // If currentTurns is not defined, the turns to advance start from initialTurn until initialTurn + turnsToAdvance -1.
  // For example, initialTurn is 1 and turnsToAdvance is 3, then the interval is [1, 3].
  //
  // This code branch is a special case. Because currentTurn is not defined, we assume the game session is not loaded.
  // As a result, we are not advancing starting from initialTurn, but from "before" initialTurn (or "into" initialTurn).
  // It is assumed here that the downstream code will interpret this special case correctly.
  //
  // Consider case of turnsToAdvance = 1. Then the interval is [initialTurn, initialTurn], as it should:
  // we just want to advance to the initialTurn.
  if (turnsToAdvanceDefined && !currentTurnDefined) {
    return {
      resolvedStartTurn: initialTurn,
      resolvedTargetTurn: initialTurn + turnsToAdvance - 1,
    }
  }

  // If currentTurns is defined, the turns to advance start from currentTurn until currentTurn + turnsToAdvance.
  // For example, if currentTurn is 8 and turnsToAdvance is 3, then the interval is [8, 11].
  if (turnsToAdvanceDefined && currentTurnDefined) {
    return {
      resolvedStartTurn: currentTurn,
      resolvedTargetTurn: currentTurn + turnsToAdvance,
    }
  }
  throw new Error('Unreachable code')
}
