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
import type { AIPlayerName } from '../../lib/codesync/aiPlayer'
import type { GameSession } from '../../lib/gameSession/GameSession'
import { AIPlayerDropdown } from './AIPlayerDropdown'
import { advanceTurns } from './advanceTurns'

export type AIPlayerControlPanelProps = {
  readonly gameSession: GameSession
  readonly setShowIntro: React.Dispatch<React.SetStateAction<boolean>>
  readonly setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>
}

const defaultStartTurn = 1
const defaultTargetTurn = 80

export function AIPlayerControlPanel(
  props: AIPlayerControlPanelProps,
): React.JSX.Element {
  const [startTurn, setStartTurn] = useState<number>(defaultStartTurn)
  const [targetTurn, setTargetTurn] = useState<number>(defaultTargetTurn)
  const [aiPlayer, setAiPlayer] = useState<AIPlayerName>('BasicAIPlayer')

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
      <CardHeader title="AI Player" sx={{ paddingBottom: '0px' }} />
      <CardContent sx={{ padding: '14px' }}>
        <Grid container spacing={1}>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {delegate1TurnToAiButton(
                props.gameSession,
                startTurn,
                targetTurn,
                props.setTurnAdvanced,
                aiPlayer,
              )}
            </Grid>
            <Grid xsOffset={'auto'}>
              <AIPlayerDropdown aiPlayer={aiPlayer} setAiPlayer={setAiPlayer} />
            </Grid>
          </Grid>
          <Grid>
            {delegateTurnsToAiButton(
              props.gameSession,
              startTurn,
              targetTurn,
              props.setTurnAdvanced,
              aiPlayer,
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
        </Grid>
      </CardContent>
    </Card>
  )
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
      label="Start"
      type="number"
      size="small"
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
      label="Target"
      type="number"
      size="small"
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

function delegate1TurnToAiButton(
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
  setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>,
  aiPlayer: AIPlayerName,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () =>
        advanceTurns(
          gameSession,
          startTurn,
          targetTurn,
          setTurnAdvanced,
          1,
          aiPlayer,
        )
      }
      disabled={!gameSession.canDelegateTurnsToAi()}
    >
      {'Delegate 1 turn to AI'}
    </Button>
  )
}

function delegateTurnsToAiButton(
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
  setTurnAdvanced: React.Dispatch<React.SetStateAction<boolean>>,
  aiPlayer: AIPlayerName,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () =>
        advanceTurns(
          gameSession,
          startTurn,
          targetTurn,
          setTurnAdvanced,
          undefined,
          aiPlayer,
        )
      }
      disabled={!gameSession.canDelegateTurnsToAi() || startTurn >= targetTurn}
    >
      {`Delegate turns to AI:`}
    </Button>
  )
}
