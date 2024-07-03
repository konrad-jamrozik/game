import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GameSessionProvider } from './components/GameSessionProvider.tsx'
import { SettingsProvider } from './components/SettingsProvider.tsx'
import { WrapInProfiler } from './components/WrapInProfiler/WrapInProfiler.tsx'
import { StoredData } from './lib/storedData/StoredData.ts'
import theme from './theme.tsx'

const rootElement = document.querySelector('#root')

if (rootElement) {
  const storedData: StoredData = new StoredData()
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <WrapInProfiler>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <SettingsProvider storedData={storedData}>
            <GameSessionProvider storedData={storedData}>
              <App />
            </GameSessionProvider>
          </SettingsProvider>
        </ThemeProvider>
      </WrapInProfiler>
    </React.StrictMode>,
  )
} else {
  console.error(
    'Could not find #root element! Ensure that index.html has an element with id="root"',
  )
}
