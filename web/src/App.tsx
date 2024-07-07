import { Link, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import { AgentsDataGrid } from './components/AgentsDataGrid/AgentsDataGrid'
import { AssetsDataGrid } from './components/AssetsDataGrid/AssetsDataGrid'
import { Charts } from './components/Charts'
import { EventsDataGrid } from './components/EventsDataGrid/EventsDataGrid'
import { FactionsDataGrid } from './components/FactionsDataGrid/FactionsDataGrid'
import { GameSessionControlPanel } from './components/GameSessionControlPanel/GameSessionControlPanel'
import IntroDialog from './components/IntroDialog'
import { MissionSitesDataGrid } from './components/MissionSitesDataGrid/MissionSitesDataGrid'
import { MissionsDataGrid } from './components/MissionsDataGrid/MissionsDataGrid'
import OutroDialog from './components/OutroDialog'
import SaveOnExit from './components/SaveOnExit'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { useGameSessionContext } from './lib/gameSession/GameSession'
import { useSettingsContext } from './lib/settings/Settings'

export default function App(): React.JSX.Element {
  const settings = useSettingsContext()
  const gameSession = useGameSessionContext()
  const currentGameState = gameSession.getCurrentGameStateUnsafe()
  const gameResult = gameSession.getGameResultUnsafe()

  const [turnAdvanced, setTurnAdvanced] = useState<boolean>(false)

  const { showIntro, setShowIntro } = useAndSetIntro(
    settings.introEnabled,
    gameSession.isInitialized(),
  )

  const { showOutro, setShowOutro } = useAndSetOutro(
    settings.outroEnabled,
    gameSession.isGameOverUnsafe(),
    turnAdvanced,
  )

  if (turnAdvanced) {
    // Reset the 'turnAdvanced' signal after it was used above.
    setTurnAdvanced(false)
  }

  return (
    <Fragment>
      <SaveOnExit />
      <IntroDialog
        {...{ introEnabled: settings.introEnabled, showIntro, setShowIntro }}
      />
      <OutroDialog
        {...{
          outroEnabled: settings.outroEnabled,
          showOutro,
          setShowOutro,
          gameResult,
        }}
      />
      <Grid
        container
        justifyContent={'center'}
        spacing={2}
        marginTop={0}
        marginX={0}
        bgcolor={'#303030'}
      >
        <Grid sx={{ bgcolor: '#200000' }}>
          <GameSessionControlPanel
            gameSession={gameSession}
            setShowIntro={setShowIntro}
            setTurnAdvanced={setTurnAdvanced}
          />
        </Grid>
        <Grid sx={{ bgcolor: '#002110' }}>
          <SettingsPanel />
        </Grid>
        <Grid sx={{ bgcolor: '#300030' }}>
          <AssetsDataGrid currentGameState={currentGameState} />
        </Grid>
        <Grid sx={{ bgcolor: '#302000' }}>
          <Stack spacing={1}>
            <MissionSitesDataGrid />
            <FactionsDataGrid />
          </Stack>
        </Grid>
        <Grid sx={{ bgcolor: '#002040' }}>
          <AgentsDataGrid />
        </Grid>
        <Grid sx={{ bgcolor: '#301040' }}>
          <MissionsDataGrid />
        </Grid>
        <Grid sx={{ bgcolor: '#002040' }}>
          <EventsDataGrid />
        </Grid>
        {settings.chartsEnabled && <Charts />}
        <Grid xs={12} sx={{ bgcolor: '#300020' }}>
          <Footer />
        </Grid>
      </Grid>
    </Fragment>
  )
}

/**
 * State hook and their state processing for IntroDialog.tsx
 */
function useAndSetIntro(
  introEnabled: boolean,
  gameSessionIsInitialized: boolean,
): {
  showIntro: boolean
  setShowIntro: React.Dispatch<React.SetStateAction<boolean>>
} {
  const [showIntro, setShowIntro] = useState<boolean>(
    introEnabled && !gameSessionIsInitialized,
  )
  if (showIntro && !introEnabled) {
    // If the 'showIntro' signal fired but intro is not enabled then clear the signal,
    // to prevent the intro showing up as soon as introEnabled is set to true later on.
    setShowIntro(false)
  }
  return { showIntro, setShowIntro }
}

/**
 * State hook and their state processing for OutroDialog.tsx
 */
function useAndSetOutro(
  outroEnabled: boolean,
  isGameOver: boolean | undefined,
  turnAdvanced: boolean,
): {
  showOutro: boolean
  setShowOutro: React.Dispatch<React.SetStateAction<boolean>>
} {
  const [showOutro, setShowOutro] = useState<boolean>(isGameOver === true)

  if (showOutro && !outroEnabled) {
    // If the 'showOutro' signal fired but intro is not enabled then clear the signal,
    // to prevent the outro showing up as soon as outroEnabled is set to true later on.
    setShowOutro(false)
  } else if (
    !showOutro &&
    outroEnabled &&
    turnAdvanced &&
    isGameOver === true
  ) {
    // Signal to show outro if the turn just advanced, causing the game to be over.
    setShowOutro(true)
  }

  return {
    showOutro,
    setShowOutro,
  }
}

function Footer(): React.JSX.Element {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Game by '}
      <Link color="inherit" href="https://github.com/konrad-jamrozik/">
        Konrad Jamrozik
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  )
}

// console.log(
//   `import.meta.env.PROD: ${import.meta.env.PROD}, import.meta.env.MODE: ${import.meta.env.MODE}, process.env.NODE_ENV: ${process.env['NODE_ENV']}`,
// )
