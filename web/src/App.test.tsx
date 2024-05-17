/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-statements */
/* eslint-disable vitest/max-expects */
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { type UserEvent, userEvent } from '@testing-library/user-event'
import _ from 'lodash'
import { describe, expect, assert, test, beforeEach } from 'vitest'
import App from './App'
import { GameSessionProvider } from './components/GameSessionProvider'
import { type StoredData, loadDataFromLocalStorage } from './main'

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
   * - the following buttons are exercised, in variety of combinations:
   *   - "Advance 1 turn"
   *   - "Revert 1 turn"
   *   - "Reset game",
   * Then:
   * - The game behaves correctly.
   */
  test('Game boot with no intro: Advance 1 turn, Revert 1 turn, Reset game', async () => {
    expect.hasAssertions()

    renderApp(false)

    expectLabel('Current turn: N/A')
    expectButtonsToBeDisabled('Reset game', 'Reset turn')

    await clickButton('Advance 1 turn')

    expectLabel('Current turn: 1')
    expectButtonToBeEnabled('Reset game')
    expectButtonToBeDisabled('Revert 1 turn')

    await clickButton('Advance 1 turn')

    expectLabel('Current turn: 2')
    expectButtonsToBeEnabled('Reset game', 'Revert 1 turn')

    await clickButton('Revert 1 turn', 'Advance 1 turn')

    expectLabel('Current turn: 1')
    expectButtonToBeDisabled('Revert 1 turn')

    await clickButton('Reset game', 'Advance 1 turn')

    expectLabel('Current turn: N/A')
    expectButtonToBeEnabled('Advance 1 turn')
    expectButtonsToBeDisabled('Reset game', 'Reset turn')
  })

  test('load data from local storage', () => {
    const storedData: StoredData = loadDataFromLocalStorage()
    assert.isNotEmpty(storedData)
    console.log('storedData', JSON.stringify(storedData, undefined, 2))
  })

  test.todo('intro dialog', () => {
    _.noop()
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

function renderApp(introEnabled: boolean): void {
  render(
    <GameSessionProvider storedGameSessionData={undefined}>
      <App settings={{ introEnabled, outroEnabled: true }} />
    </GameSessionProvider>,
  )
}

function expectLabel(text: string): void {
  const htmlElement: HTMLElement = screen.getByText(text)
  expect(htmlElement.tagName).toBe('P')
  expect(htmlElement).toBeInTheDocument()
}

function expectButtonToBeEnabled(text: string): void {
  expectButtonsToBeEnabled(text)
}

function expectButtonsToBeEnabled(...texts: string[]): void {
  expectButtonsToBe(texts, true)
}

function expectButtonToBeDisabled(text: string): void {
  expectButtonsToBeDisabled(text)
}

function expectButtonsToBeDisabled(...texts: string[]): void {
  expectButtonsToBe(texts, false)
}

function expectButtonsToBe(texts: string[], enabled: boolean): void {
  for (const text of texts) {
    const htmlElement: HTMLElement = screen.getByText(text)
    expect(htmlElement.tagName).toBe('BUTTON')
    if (enabled) {
      expect(htmlElement).toBeEnabled()
    } else {
      expect(htmlElement).toBeDisabled()
    }
  }
}

async function clickButton(text: string, waitForText?: string): Promise<void> {
  expectButtonToBeEnabled(text)

  console.log(`----- CLICK BUTTON: '${text}'`)
  const user: UserEvent = userEvent.setup()
  await user.click(screen.getByText(text))
  await waitForButtonToBeEnabled(waitForText ?? text)
  console.log(`----- CLICK BUTTON: '${text}' DONE`)
}

async function waitForButtonToBeEnabled(text: string): Promise<void> {
  await waitFor(
    () => {
      expectButtonToBeEnabled(text)
    },
    {
      timeout: 5000,
    },
  )
}
