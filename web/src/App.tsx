import { Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import { AgentsDataGrid } from './components/AgentsDataGrid/AgentsDataGrid'
import { AssetsDataGrid } from './components/AssetsDataGrid/AssetsDataGrid'
import { GameSessionControlPanel } from './components/GameSessionControlPanel/GameSessionControlPanel'
import { GameStatsLineChart } from './components/GameStatsLineChart'
import IntroDialog from './components/IntroDialog'
import { MissionSitesDataGrid } from './components/MissionSitesDataGrid/MissionSitesDataGrid'
import OutroDialog from './components/OutroDialog'
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel'
import { useGameSessionContext } from './lib/GameSession'
import {
  agentStatsDataSeries,
  intelStatsDataSeries,
  miscStatsDataSeries,
  missionsStatsDataSeries,
  moneyStatsDataSeries,
} from './lib/GameStateDataSeries'
import type { Settings } from './main'
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

const lineChartAspectRatio = '1.5'
const lineChartMaxWidth = '700px'

// eslint-disable-next-line max-lines-per-function
export default function App({
  settings,
}: {
  settings: Settings
}): React.JSX.Element {
  console.log(`render App.tsx`)
  const gameSession = useGameSessionContext()
  const gameStates = gameSession.getGameStates()
  const currentGameState = gameSession.getCurrentGameStateUnsafe()
  const isGameOver = gameSession.isGameOverUnsafe()
  const gameResult = gameSession.getGameResultUnsafe()

  const [turnAdvanced, setTurnAdvanced] = useState<boolean>(false)

  const { introEnabled, setIntroEnabled, showIntro, setShowIntro } =
    useAndSetIntro(settings, gameSession.isInitialized())

  const { outroEnabled, setOutroEnabled, showOutro, setShowOutro } =
    useAndSetOutro(settings, isGameOver, turnAdvanced)

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
              introEnabled,
              setIntroEnabled,
              outroEnabled,
              setOutroEnabled,
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
        <Grid
          xs={12}
          lg={6}
          sx={{
            bgcolor: '#003000',
            aspectRatio: lineChartAspectRatio,
            maxWidth: lineChartMaxWidth,
          }}
        >
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={moneyStatsDataSeries}
          />
        </Grid>
        <Grid
          xs={12}
          lg={6}
          sx={{
            bgcolor: '#303000',
            aspectRatio: lineChartAspectRatio,
            maxWidth: lineChartMaxWidth,
          }}
        >
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={agentStatsDataSeries}
          />
        </Grid>
        <Grid
          xs={12}
          lg={6}
          sx={{
            bgcolor: '#402000',
            aspectRatio: lineChartAspectRatio,
            maxWidth: lineChartMaxWidth,
          }}
        >
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={intelStatsDataSeries}
          />
        </Grid>
        <Grid
          xs={12}
          lg={6}
          sx={{
            bgcolor: '#002040',
            aspectRatio: lineChartAspectRatio,
            maxWidth: lineChartMaxWidth,
          }}
        >
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={miscStatsDataSeries}
          />
        </Grid>
        <Grid
          xs={12}
          lg={6}
          sx={{
            bgcolor: '#003030',
            aspectRatio: lineChartAspectRatio,
            maxWidth: lineChartMaxWidth,
          }}
        >
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={missionsStatsDataSeries}
          />
        </Grid>
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
  settings: Settings,
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
  settings: Settings,
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
