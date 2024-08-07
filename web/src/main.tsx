import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { DevTools } from './components/DevTools/DevTools.tsx'
import { GameSessionProvider } from './components/GameSessionProvider.tsx'
import { SettingsProvider } from './components/SettingsProvider.tsx'
import { StoredData } from './lib/storedData/StoredData.ts'
import theme from './theme.tsx'

const rootElement = document.querySelector('#root')

if (rootElement) {
  const storedData: StoredData = new StoredData()
  ReactDOM.createRoot(rootElement).render(
    <DevTools id="top_level">
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <SettingsProvider storedData={storedData}>
          <GameSessionProvider storedData={storedData}>
            <App />
          </GameSessionProvider>
        </SettingsProvider>
      </ThemeProvider>
    </DevTools>,
  )
} else {
  console.error(
    'Could not find #root element! Ensure that index.html has an element with id="root"',
  )
}
