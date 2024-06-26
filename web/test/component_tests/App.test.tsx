import { screen } from '@testing-library/react'
import { assert, describe, expect, test } from 'vitest'
import { loadDataFromLocalStorage } from '../../src/lib/storedData/StoredData'
import type { StoredDataType } from '../../src/lib/storedData/StoredDataType'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for App.tsx', () => {
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
