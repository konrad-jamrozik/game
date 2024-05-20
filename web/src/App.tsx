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

  // For explanation of introEnabled and showIntro states, see comment on IntroDialog() component.
  const [introEnabled, setIntroEnabled] = useState<boolean>(
    settings.introEnabled,
  )
  const [outroEnabled, setOutroEnabled] = useState<boolean>(
    settings.outroEnabled,
  )
  const [showIntro, setShowIntro] = useState<boolean>(
    introEnabled && !gameSession.isInitialized(),
  )

  const [showOutro, setShowOutro] = useState<boolean>(
    outroEnabled && isGameOver === true,
  )

  // console.log(
  //   `import.meta.env.PROD: ${import.meta.env.PROD}, import.meta.env.MODE: ${import.meta.env.MODE}, process.env.NODE_ENV: ${process.env['NODE_ENV']}`,
  // )
  // console.log(`introEnabled: ${introEnabled}, showIntro: ${showIntro}`)

  // This design pattern perhaps should be changed in the future. See docs/technical.md for details.
  const [gameStateUpdated, setGameStateUpdated] = useState<boolean>(false)
  console.log(`gameStateUpdated: ${gameStateUpdated}`)
  if (outroEnabled && !showOutro && gameStateUpdated && isGameOver === true) {
    setShowOutro(true)
  }
  if (gameStateUpdated) {
    setGameStateUpdated(false)
  }

  return (
    <Fragment>
      <IntroDialog {...{ showIntro, setShowIntro }} />
      <OutroDialog {...{ gameResult, showOutro, setShowOutro }} />
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
            introEnabled={introEnabled}
            setShowIntro={setShowIntro}
            setGameStateUpdated={setGameStateUpdated}
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
