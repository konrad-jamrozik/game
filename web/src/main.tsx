import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import _ from 'lodash'
import React, { Profiler } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GameSessionProvider } from './components/GameSessionProvider.tsx'
import { SettingsProvider } from './components/SettingsProvider.tsx'
import { StoredData } from './lib/storedData/StoredData.ts'
import theme from './theme.tsx'

const rootElement = document.querySelector('#root')

const profile = true

function maybeWrapWithProfiler(
  component: React.JSX.Element,
): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return profile ? (
    <Profiler id="top_level" onRender={onRender}>
      {component}
    </Profiler>
  ) : (
    component
  )
}

function AppWithProfiler({
  storedData,
}: {
  storedData: StoredData
}): React.JSX.Element {
  return maybeWrapWithProfiler(
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SettingsProvider storedData={storedData}>
        <GameSessionProvider storedData={storedData}>
          <App />
        </GameSessionProvider>
      </SettingsProvider>
    </ThemeProvider>,
  )
}

if (rootElement) {
  const storedData: StoredData = new StoredData()
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWithProfiler storedData={storedData} />
    </React.StrictMode>,
  )
} else {
  console.error(
    'Could not find #root element! Ensure that index.html has an element with id="root"',
  )
}

// https://react.dev/reference/react/Profiler#onrender-parameters
// eslint-disable-next-line @typescript-eslint/max-params
function onRender(
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
): void {
  console.log(
    `Profiler.onRender: id: ${id}, phase: ${_.padStart(phase, 13)}, ` +
      `actualDuration: ${seconds(actualDuration)}, baseDuration: ${seconds(baseDuration)}, ` +
      `startTime: ${seconds(startTime)}, commitTime: ${seconds(commitTime)}`,
  )
}

function seconds(milliseconds: number): string {
  const value = (Math.round(milliseconds / 100) / 10).toString()

  const [integer, decimal] = _.split(value, '.')

  // Ensure the integer part is padded to have a length of 3 (for example), so the dot is always at the same spot
  const paddedInteger = _.padStart(integer, 3, ' ')

  // Reconstruct the value with the padded integer part and the decimal part
  // Ensuring there's always one decimal digit
  const paddedValue = `${paddedInteger}.${(decimal ?? '') || '0'}`

  return paddedValue
}
