import { Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import { AgentsDataGrid } from './components/AgentsDataGrid/AgentsDataGrid'
import { AssetsDataGrid } from './components/AssetsDataGrid/AssetsDataGrid'
import { Charts } from './components/Charts'
import { GameSessionControlPanel } from './components/GameSessionControlPanel/GameSessionControlPanel'
import IntroDialog from './components/IntroDialog'
import { MissionSitesDataGrid } from './components/MissionSitesDataGrid/MissionSitesDataGrid'
import OutroDialog from './components/OutroDialog'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { useGameSessionContext } from './lib/gameSession/GameSession'
import type { StoredData } from './lib/storedData/StoredData'
import type { SettingsType } from './lib/storedData/StoredDataType'
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

// eslint-disable-next-line max-lines-per-function
export default function App({
  storedData,
}: {
  storedData: StoredData
}): React.JSX.Element {
  console.log(`render App.tsx`)
  const gameSession = useGameSessionContext()
  const currentGameState = gameSession.getCurrentGameStateUnsafe()
  const gameResult = gameSession.getGameResultUnsafe()
  const settings = storedData.getSettings()

  const [turnAdvanced, setTurnAdvanced] = useState<boolean>(false)

  const { introEnabled, setIntroEnabled, showIntro, setShowIntro } =
    useAndSetIntro(settings, gameSession.isInitialized())

  const { outroEnabled, setOutroEnabled, showOutro, setShowOutro } =
    useAndSetOutro(settings, gameSession.isGameOverUnsafe(), turnAdvanced)

  const [chartsEnabled, setChartsEnabled] = useState<boolean>(
    settings.chartsEnabled,
  )

  if (turnAdvanced) {
    // Reset the 'turnAdvanced' signal after it was used.
    setTurnAdvanced(false)
  }

  return (
    <Fragment>
      <IntroDialog {...{ introEnabled, showIntro, setShowIntro }} />
      <OutroDialog {...{ outroEnabled, showOutro, setShowOutro, gameResult }} />
      <Grid
        container
        justifyContent={'center'}
        spacing={2}
        marginTop={2}
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
          <SettingsPanel
            {...{
              storedData,
              introEnabled,
              setIntroEnabled,
              outroEnabled,
              setOutroEnabled,
              chartsEnabled,
              setChartsEnabled,
            }}
          />
        </Grid>
        <Grid sx={{ bgcolor: '#300030' }}>
          <AssetsDataGrid assets={currentGameState?.Assets} />
        </Grid>
        <Grid sx={{ bgcolor: '#302000' }}>
          <MissionSitesDataGrid />
        </Grid>
        <Grid sx={{ bgcolor: '#002040' }}>
          <AgentsDataGrid />
        </Grid>
        {chartsEnabled && <Charts />}
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
  settings: SettingsType,
  gameSessionIsInitialized: boolean,
): {
  introEnabled: boolean
  setIntroEnabled: React.Dispatch<React.SetStateAction<boolean>>
  showIntro: boolean
  setShowIntro: React.Dispatch<React.SetStateAction<boolean>>
} {
  const [introEnabled, setIntroEnabled] = useState<boolean>(
    settings.introEnabled,
  )
  const [showIntro, setShowIntro] = useState<boolean>(
    settings.introEnabled && !gameSessionIsInitialized,
  )
  if (showIntro && !introEnabled) {
    // If the 'showIntro' signal fired but intro is not enabled then clear the signal,
    // to prevent the intro showing up as soon as introEnabled is set to true later on.
    setShowIntro(false)
  }
  return { introEnabled, setIntroEnabled, showIntro, setShowIntro }
}

/**
 * State hook and their state processing for OutroDialog.tsx
 */
function useAndSetOutro(
  settings: SettingsType,
  isGameOver: boolean | undefined,
  turnAdvanced: boolean,
): {
  outroEnabled: boolean
  setOutroEnabled: React.Dispatch<React.SetStateAction<boolean>>
  showOutro: boolean
  setShowOutro: React.Dispatch<React.SetStateAction<boolean>>
} {
  const [outroEnabled, setOutroEnabled] = useState<boolean>(
    settings.outroEnabled,
  )

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
    outroEnabled,
    setOutroEnabled,
    showOutro,
    setShowOutro,
  }
}

// console.log(
//   `import.meta.env.PROD: ${import.meta.env.PROD}, import.meta.env.MODE: ${import.meta.env.MODE}, process.env.NODE_ENV: ${process.env['NODE_ENV']}`,
// )
