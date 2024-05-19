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

  // This design pattern perhaps should be changed in the future. See [1].
  const [gameStateUpdated, setGameStateUpdated] = useState<boolean>(false)
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

// [1] The 'gameStateUpdated' design pattern I currently adopted solves the following problem:
// What if I want to call backend API, get the result and based on the result do a one-time
// conditional update to some state?
//
// I need it specifically to determine when to show up the game outro dialog.
// If it is to pop-up, it must happen exactly once, as a result of the data returned from the backend.
// It should not happen again on further rerenders.
//
// I solved this by a two-step process simulating a "one-time" event:
// 1. When the backend call returns it says if game state was updated or not. If it was, it sets the "gameStateUpdated"
//    state. This will trigger future re-render.
// 2. When the re-render happens and sees the "gameStateUpdated" is true, it sets it to false, thus preventing further
//    re-renders thinking that game state updated.
//
// While this solution works it feels clunky and introduces extra re-render. Ideally, when the backend API call returns,
// instead of setting "gameStateUpdated" to true, I could immediately determine if outro dialog needs to be shown
// and if so, set appropriate state.
//
// However: normal re-render determines if to show outro dialog based on the react state containing the game session state,
// but when the backend API call updating the game session state returns, the react state is not updated yet.
//
// Basically the flow as implemented is as follows:
//
//  newGameState = await backendApiCall()
//  gameState.update(newGameState)
//  gameStateUpdated.set(true)
//
//  re-render:
//  if (showOutroDialog(gameState, gameStateUpdated)) { showOutroDialog = true }
//  if (gameStateUpdated) { gameStateUpdated = false }
//
// But I would wish for this flow, but it violates React rules:
//
//  newGameState = await backendApiCall()
//  updatedGameState = gameState.update(newGameState) // ❗VIOLATES REACT RULES ❗
//  if (showOutroDialog(updatedGameState)) { showOutroDialog = true }
//
// I had a chat with ChatGPT about this here:
// https://chatgpt.com/g/g-AVrfRPzod-react-ai/c/b1bffd24-2aa1-4899-80a3-855c1b6c2843?oai-dm=1
// It recommended 'useEffect' but I think this is the wrong approach.
// What convinced me is the discussion about 'chain of computations' [2] and the fact
// this scenario is a one-time response to a user-trigger API call returning,
// instead of some kind of synchronization that needs to be updated independently of user actions. [3][4]
//
// [2] https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations
// [3] https://react.dev/learn/synchronizing-with-effects
// [4] https://react.dev/learn/separating-events-from-effects
// Bonus:
// https://stackoverflow.com/questions/58818727/react-usestate-not-setting-initial-value
