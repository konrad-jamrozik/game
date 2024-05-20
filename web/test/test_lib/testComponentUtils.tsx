import { render } from '@testing-library/react'
import App from '../../src/App'
import { GameSessionProvider } from '../../src/components/GameSessionProvider'
import { StoredData } from '../../src/lib/StoredData'
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
  storedData.setIntroEnabled(introEnabled)
  storedData.reload()
  storedData.setOutroEnabled(true)
  storedData.reload()
  render(
    <GameSessionProvider storedGameSessionData={undefined}>
      <App storedData={storedData} />
    </GameSessionProvider>,
  )
  return {
    controlPanel: new GameSessionControlPanelFixture(),
    settingsPanel: new SettingsPanelFixture(),
    agentsDataGrid: new AgentsDataGridFixture(),
    introDialog: new IntroDialogFixture(),
    outroDialog: new OutroDialogFixture(),
  }
}
