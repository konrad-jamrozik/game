import { Button, Card, CardContent, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import { initialTurn } from '../../lib/codesync/GameState'
import { startTiming } from '../../lib/dev'
import type { GameSession } from '../../lib/gameSession/GameSession'
import { Label } from '../utilities/Label'
import { advanceTurns } from './advanceTurns'

export type GameSessionControlPanelProps = {
  readonly gameSession: GameSession
  readonly setShowIntro: React.Dispatch<React.SetStateAction<boolean>>
  readonly setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>
}

const defaultStartTurn = 1
const defaultTargetTurn = 80

export function GameSessionControlPanel(
  props: GameSessionControlPanelProps,
): React.JSX.Element {
  const [startTurn, _setStartTurn] = useState<number>(defaultStartTurn)
  const [targetTurn, _setTargetTurn] = useState<number>(defaultTargetTurn)

  function gameRunMsg(): string {
    return `Game ran until turn ${props.gameSession.getCurrentTurnNo()}. Result: ${props.gameSession.getGameResult()}`
  }

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
              {advanceTimeBy1TurnButton(
                props.gameSession,
                startTurn,
                targetTurn,
                props.setTurnAdvanced,
              )}
            </Grid>
            <Grid xsOffset={'auto'}>
              {resetCurrentTurnButton(props.gameSession)}
            </Grid>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid sx={{ alignContent: 'bottom' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {saveGameButton(props.gameSession)}
                <Label>{`Saved turn: ${props.gameSession.savedTurn ?? 'N/A'}`}</Label>
              </Stack>
            </Grid>
            <Grid xsOffset={'auto'}>
              {resetGameSessionButton(props.gameSession, props.setShowIntro)}
            </Grid>
          </Grid>
          {props.gameSession.isInitialized() && (
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
  return `Current turn: ${gameSession.getCurrentTurnNoUnsafe() ?? 'N/A'}`
}

function advanceTimeBy1TurnButton(
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
  setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>,
): React.JSX.Element {
  return (
    <Button
      variant="contained"
      onClick={async () =>
        advanceTurns(gameSession, startTurn, targetTurn, setTurnAdvanced, 1)
      }
      disabled={!gameSession.canAdvanceTime()}
    >
      {'Advance 1 turn'}
    </Button>
  )
}

function resetCurrentTurnButton(gameSession: GameSession): React.JSX.Element {
  const playerMadeActions: boolean | undefined =
    gameSession.hasPlayerMadeActionsInCurrentTurn()
  const isDisabled =
    !gameSession.isInitialized() ||
    gameSession.loading ||
    (gameSession.getCurrentTurnNo() === initialTurn &&
      !(playerMadeActions ?? false))

  const label =
    (playerMadeActions ?? false) || !gameSession.isInitialized()
      ? `Reset turn`
      : `Revert 1 turn`

  function reset(): void {
    console.log(`Executing reset(). Resetting elapsed time.`)
    startTiming()
    if (playerMadeActions ?? false) {
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

function resetGameSessionButton(
  gameSession: GameSession,
  setShowIntro: React.Dispatch<React.SetStateAction<boolean>>,
): React.JSX.Element {
  function resetGame(): void {
    console.log(`Executing resetGame(). Resetting elapsed time.`)
    startTiming()
    gameSession.resetGame()
    setShowIntro(true)
  }

  return (
    <Button
      variant="outlined"
      onClick={resetGame}
      disabled={
        // For the 'Reset Game' button to be disabled, the error must be undefined,
        // because if it is defined, we want to allow resetting game.
        _.isUndefined(gameSession.error) &&
        (!gameSession.isInitialized() || gameSession.loading)
      }
      color="error"
    >
      {`Reset game`}
    </Button>
  )
}

function saveGameButton(gameSession: GameSession): React.JSX.Element {
  function saveGame(): void {
    gameSession.save()
  }

  return (
    <Button
      variant="outlined"
      onClick={saveGame}
      disabled={!gameSession.isInitialized() || gameSession.loading}
      color="primary"
    >
      {`Save game`}
    </Button>
  )
}
