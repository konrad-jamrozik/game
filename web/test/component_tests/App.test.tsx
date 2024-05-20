import { screen, cleanup } from '@testing-library/react'
import _ from 'lodash'
import { describe, expect, assert, test, beforeAll, beforeEach } from 'vitest'
import {
  loadDataFromLocalStorage,
  type StoredDataType,
} from '../../src/lib/StoredData'
import { renderApp } from '../test_lib/testComponentUtils'
import { verifyBackendApiIsReachable } from '../test_lib/testUtils'

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
   * - The game behaves correctly.
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

  test('Load data from local storage', () => {
    localStorage.clear()
    const storedData: StoredDataType = loadDataFromLocalStorage()
    assert.isNotEmpty(storedData)
    console.log('storedData', JSON.stringify(storedData, undefined, 2))
  })

  // eslint-disable-next-line vitest/no-disabled-tests
  test.skip('scratchpad', async () => {
    expect.hasAssertions()
    const { controlPanel } = renderApp(false)
    await controlPanel.advance1Turn()
  })

  // eslint-disable-next-line vitest/no-disabled-tests
  test.skip('screen debug', () => {
    import.meta.env['DEBUG_PRINT_LIMIT'] = '1000'
    console.log('DEBUG_PRINT_LIMIT:', import.meta.env['DEBUG_PRINT_LIMIT'])
    renderApp(false)
    for (const checkbox of screen.getAllByRole('checkbox', {
      name: 'Show Intro',
    })) {
      console.log('checkbox', checkbox)
    }
  })
})

// kja: CI tests fail sometimes due to relying on cloud backend and slow cold boot:
// they hit a timeout. Re-running works as the API is booted and replies within timeout.

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
