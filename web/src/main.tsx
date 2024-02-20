import { ThemeProvider } from '@emotion/react'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GameSessionProvider } from './components/GameSessionProvider.tsx'
import type { GameSessionData } from './lib/GameSessionData.ts'
import theme from './theme.tsx'

const rootElement = document.querySelector('#root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <GameSessionProvider storedGameSessionData={loadDataFromLocalStorage()}>
          <App />
        </GameSessionProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )
} else {
  console.error(
    'Could not find #root element! Ensure that index.html has an element with id="root"',
  )
}

function loadDataFromLocalStorage(): GameSessionData | undefined {
  const storedGameSessionDataString: string | null =
    localStorage.getItem('gameSessionData')
  if (!_.isNil(storedGameSessionDataString)) {
    const gameSessionData: GameSessionData = JSON.parse(
      storedGameSessionDataString,
    ) as GameSessionData
    console.log('Loaded game session data from local storage', gameSessionData)
    return gameSessionData
    // eslint-disable-next-line no-else-return
  } else {
    console.log('No game session data found in local storage')
    return undefined
  }
}
