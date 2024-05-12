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
  const storedData: StoredData = loadDataFromLocalStorage()
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <GameSessionProvider storedGameSessionData={storedData.gameSessionData}>
          <App settings={storedData.settings} />
        </GameSessionProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )
} else {
  console.error(
    'Could not find #root element! Ensure that index.html has an element with id="root"',
  )
}

// kja move this data loading logic to its own class + load by iterating keys of StoredData type
export function loadDataFromLocalStorage(): StoredData {
  const gameSessionData = loadGameSessionData()
  const settings = loadSettings()
  return { gameSessionData, settings }
}

function loadGameSessionData(): GameSessionData | undefined {
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

function loadSettings(): Settings {
  const storedSettingsString: string | null = localStorage.getItem('settings')
  if (!_.isNil(storedSettingsString)) {
    const settings: Settings = JSON.parse(storedSettingsString) as Settings
    console.log('Loaded settings from local storage', settings)
    return settings
    // eslint-disable-next-line no-else-return
  } else {
    console.log('No settings found in local storage. Using default settings.')

    return { introEnabled: true, outroEnabled: true }
  }
}

export type Settings = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
}
export type StoredData = {
  readonly settings: Settings
  readonly gameSessionData?: GameSessionData | undefined
}
// kja issue when trying to store 300 turns:
// Uncaught (in promise) DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'gameSessionData' exceeded the quota.
// https://stackoverflow.com/questions/23977690/setting-the-value-of-dataurl-exceeded-the-quota
