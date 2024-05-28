import { render } from '@testing-library/react'
import App from '../../src/App'
import { GameSessionProvider } from '../../src/components/GameSessionProvider'
import { SettingsProvider } from '../../src/components/SettingsProvider'
import { StoredData } from '../../src/lib/storedData/StoredData'
import { AgentsDataGridFixture } from '../test_fixtures/AgentsDataGridFixture'
import { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { IntroDialogFixture } from '../test_fixtures/IntroDialogFixture'
import { OutroDialogFixture } from '../test_fixtures/OutroDialogFixture'
import { SettingsPanelFixture } from '../test_fixtures/SettingsPanelFixture'

export function renderApp(introEnabled: boolean): {
  controlPanel: GameSessionControlPanelFixture
  settingsPanel: SettingsPanelFixture
  agentsDataGrid: AgentsDataGridFixture
  introDialog: IntroDialogFixture
  outroDialog: OutroDialogFixture
} {
  const storedData = new StoredData()
  storedData.persistSettingsData({
    introEnabled,
    outroEnabled: true,
    chartsEnabled: false,
  })
  render(
    <SettingsProvider storedData={storedData}>
      <GameSessionProvider storedData={storedData}>
        <App />
      </GameSessionProvider>
    </SettingsProvider>,
  )
  return {
    controlPanel: new GameSessionControlPanelFixture(),
    settingsPanel: new SettingsPanelFixture(),
    agentsDataGrid: new AgentsDataGridFixture(),
    introDialog: new IntroDialogFixture(),
    outroDialog: new OutroDialogFixture(),
  }
}
