import { screen, cleanup } from '@testing-library/react'
import _ from 'lodash'
import { describe, expect, assert, test, beforeAll, beforeEach } from 'vitest'
import { type StoredData, loadDataFromLocalStorage } from '../../src/main'
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
    const storedData: StoredData = loadDataFromLocalStorage()
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
