/* eslint-disable max-statements */
import { cleanup } from '@testing-library/react'
import _ from 'lodash'
import { describe, expect, assert, test, beforeAll, beforeEach } from 'vitest'
import {
  type StoredDataType,
  loadDataFromLocalStorage,
} from '../../src/lib/StoredData'
import { renderApp } from '../test_lib/testComponentUtils'
import { verifyBackendApiIsReachable } from '../test_lib/testUtils'

describe('Test suite for OutroDialog.tsx', () => {
  beforeAll(async () => {
    await verifyBackendApiIsReachable()
  })

  beforeEach(() => {
    // Needed per:
    // https://stackoverflow.com/questions/78493555/how-can-i-run-tests-in-a-single-file-in-parallel-when-using-screen-from-testin
    cleanup()
  })

  test('Outro dialog and setting', async () => {
    expect.hasAssertions()

    // Given:
    // - The game session is not started.
    // - The 'show outro' is enabled.
    // When:
    // - The turn is advanced thus starting the game session.
    // Then:
    // - No outro dialog appears.
    const { controlPanel, settingsPanel, agentsDataGrid, outroDialog } =
      renderApp(false)
    settingsPanel.assertShowOutro(true)
    await controlPanel.advance1Turn()
    outroDialog.assertVisibility('not present')

    // Given:
    // - The game is about to be lost when turn is advanced
    // - The 'show outro' is enabled
    // When:
    // - The turn is advanced
    // Then:
    // - The game is lost and the outro dialog appears
    for await (const agentIdx of _.range(0, 10)) {
      console.log(`Hiring agent ${agentIdx + 1}`)
      await agentsDataGrid.hireAgent()
    }
    await controlPanel.advance1Turn(true)
    controlPanel.assertTurn2()
    outroDialog.assertVisibility('visible', true)

    // Given:
    // - The game is over
    // - The 'show outro' is enabled
    // When:
    // - The turn is reverted and then advanced again
    // Then:
    // - The game is lost and the outro dialog appears
    await outroDialog.close()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1()
    await controlPanel.advance1Turn(true)
    controlPanel.assertTurn2()
    outroDialog.assertVisibility('visible', true)

    // Given:
    // - The game is over
    // - The 'show outro' is enabled
    // When:
    // - The 'show outro' gets disabled
    // - The turn is reverted and then advanced again
    // Then:
    // - The game is over but the outro dialog does not appear
    await outroDialog.close()
    await settingsPanel.disableShowOutro()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1()
    await controlPanel.advance1Turn(true)
    controlPanel.assertTurn2()
    outroDialog.assertVisibility('not present')
  }, 20_000)

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
})
