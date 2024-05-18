/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-statements */
/* eslint-disable vitest/max-expects */
import { render, screen, cleanup } from '@testing-library/react'
import { type UserEvent, userEvent } from '@testing-library/user-event'
import _ from 'lodash'
import { describe, expect, assert, test, beforeAll, beforeEach } from 'vitest'
import App from '../src/App'
import { GameSessionProvider } from '../src/components/GameSessionProvider'
import { type StoredData, loadDataFromLocalStorage } from '../src/main'
import { GameSessionControlPanelFixture } from './fixtures/GameSessionControlPanelFixture'
import { IntroDialogFixture } from './fixtures/IntroDialogFixture'
import { SettingsPanelFixture } from './fixtures/SettingsPanelFixture'
import { verifyBackendApiIsReachable } from './testUtils'

// kja tests:

// kja: CI tests fail sometimes due to relying on cloud backend and slow cold boot:
// they hit a timeout. Re-running works as the API is booted and replies within timeout.

// Build abstractions like:
// "DoPlayerAction(count)" which hires agents
// "EndGameInOneTurn" which hires agents to the max and advances to force game over

// Test: Testing intro/outro
// Assume: "Show intro" and "Show outro" are enabled in settings and this is the default state.
// When the game is loaded for the first time, the intro dialog is displayed.
// When the game is reset, the intro dialog is displayed.
// Closing the intro dialog hides it.

// Test: Reset turn
// show that 'revert turn' changes to 'reset turn' when agent gets hired.
// show that 'revert turn' reverts to the END of previous turn (after all player actions), not beginning. See also below:
// test for the corner cases described in GameSessionData.resetGameState
// I.e. how to get back to previous turn end (just by revert) and beginning (by revert, revert, advance)

// Test: Clear local storage
// question: do tests have isolated local storage?
// question: if I disable test isolation, how much it will speed up things?

// Test: delegate turn to AI:
// Always need to assert Result is undecided until I get seeds in
// From turn N/A: start 1 target 5
// From turn 1: start 1 target 5
// Then (from turn 5): start 1, target 5
// Then (from turn 5): start 4, target 5
// Then (from turn 5): start 5, target 6
// Then (from turn 6): start 3, target 4
// Then (from turn 4): start 6, target 7
// But also just read and cover: resolveStartAndTargetTurn

describe('Test suite for App.tsx', () => {
  beforeAll(async () => {
    await verifyBackendApiIsReachable()
  })

  beforeEach(() => {
    // Needed per:
    // https://stackoverflow.com/questions/78493555/how-can-i-run-tests-in-a-single-file-in-parallel-when-using-screen-from-testin
    cleanup()
  })

  /**
   * Given:
   * - Render of App.tsx
   *   - with setting denoting to not show intro dialog
   * When:
   * - the following buttons are exercised, in this order:
   *   - "Advance 1 turn"
   *   - "Advance 1 turn"
   *   - "Revert 1 turn"
   *   - "Reset game"
   * Then:
   * - The game should behave correctly.
   */
  test('Game boot with no intro: Advance 1 turn, Revert 1 turn, Reset game', async () => {
    expect.hasAssertions()

    const { controlPanel } = renderApp(false)

    controlPanel.assertNoGameSession()
    await controlPanel.advance1Turn()
    controlPanel.assertTurn1()
    await controlPanel.advance1Turn()
    controlPanel.assertTurn2()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1()
    await controlPanel.resetGame()
    controlPanel.assertNoGameSession()
  })

  test('STUB Intro dialog and setting', async () => {
    expect.hasAssertions()

    // When the app is rendered with 'show intro' settings:
    // - The intro dialog should appears.
    // - The corresponding setting should be set.
    const { controlPanel, settingsPanel, introDialog } = renderApp(true)
    introDialog.assertVisible(true)
    await introDialog.close()
    settingsPanel.assertShowIntro(true)

    await controlPanel.advance1Turn()

    // When the game is reset when the 'show intro' setting is enabled:
    // - The intro dialog should appear.
    await controlPanel.resetGame()
    introDialog.assertVisible(true)

    await introDialog.close()
    await controlPanel.advance1Turn()

    // When the 'show intro' setting is disabled and then the game is reset:
    // - The intro dialog should not appear.
    await settingsPanel.disableShowIntro()
    await controlPanel.resetGame()
    introDialog.assertVisible(false)
  })

  test('load data from local storage', () => {
    const storedData: StoredData = loadDataFromLocalStorage()
    assert.isNotEmpty(storedData)
    console.log('storedData', JSON.stringify(storedData, undefined, 2))
  })

  test.todo('test App', async () => {
    expect.hasAssertions()
    const user: UserEvent = userEvent.setup()

    renderApp(true)

    const introDialogHeader: HTMLElement = screen.getByText('Situation Report')
    expect(introDialogHeader).toBeVisible()

    console.log('clicking I accept the responsibility')
    await user.click(screen.getByText('I accept the responsibility'))

    expect(introDialogHeader).not.toBeVisible()

    const gameSessionHeader: HTMLElement = screen.getByText('Game Session')
    expect(gameSessionHeader).toBeInTheDocument()

    const resetGame: HTMLElement = screen.getByText('Reset game')
    expect(resetGame).toBeDisabled()

    expect(screen.getByText('Current turn: N/A')).toBeInTheDocument()

    console.log('clicking Advance 1 turn')
    await user.click(screen.getByText('Advance 1 turn'))

    await screen.findByText('Current turn: 1', undefined, { timeout: 3000 })
    expect(screen.getByText('Current turn: 1')).toBeInTheDocument()

    expect(resetGame).toBeEnabled()
    expect(introDialogHeader).not.toBeVisible()
    console.log('clicking Reset game')
    await user.click(screen.getByText('Reset game'))
    console.log('finding situation report')
    await screen.findByText('Situation Report', undefined, { timeout: 3000 })
    console.log('asserting')
    expect(screen.getByText('Situation Report')).toBeVisible()
  })
})

function renderApp(introEnabled: boolean): {
  controlPanel: GameSessionControlPanelFixture
  settingsPanel: SettingsPanelFixture
  introDialog: IntroDialogFixture
} {
  render(
    <GameSessionProvider storedGameSessionData={undefined}>
      <App settings={{ introEnabled, outroEnabled: true }} />
    </GameSessionProvider>,
  )
  return {
    controlPanel: new GameSessionControlPanelFixture(),
    settingsPanel: new SettingsPanelFixture(),
    introDialog: new IntroDialogFixture(),
  }
}
