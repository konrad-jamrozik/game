/* eslint-disable max-statements */
import _ from 'lodash'
import { describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for OutroDialog.tsx', () => {
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
    settingsPanel.assertOutroEnabled(true)
    await controlPanel.advance1Turn()
    outroDialog.assertVisibility('not present')

    // Given:
    // - The game is about to be lost when turn is advanced,
    //   which is forced by hiring enough agents to run out of money.
    // - The 'show outro' is enabled
    // When:
    // - The turn is advanced
    // Then:
    // - The game is lost and the outro dialog appears
    await agentsDataGrid.hire10Agents()
    await controlPanel.advance1Turn(true, true)
    outroDialog.assertVisibility('visible', true)

    // Given:
    // - The game is over
    // - The 'show outro' is enabled
    // When:
    // - The turn is reverted and then advanced again
    // Then:
    // - The game is lost and the outro dialog appears
    await outroDialog.close()
    controlPanel.assertTurn2()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1(true)
    await controlPanel.advance1Turn(true, true)
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
    controlPanel.assertTurn2()
    await settingsPanel.disableOutro()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1(true)
    await controlPanel.advance1Turn(true)
    controlPanel.assertTurn2()
    outroDialog.assertVisibility('not present')
  })
})
