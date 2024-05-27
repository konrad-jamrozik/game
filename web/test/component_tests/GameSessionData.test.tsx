import { describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for GameSessionData.ts', () => {
  test('Reset to beginning of current turn', async () => {
    expect.hasAssertions()

    const { controlPanel, agentsDataGrid } = renderApp(false)

    controlPanel.assertNoGameSession()
    await controlPanel.advance1Turn()
    controlPanel.assertTurn1()
    await agentsDataGrid.hireAgent()
    controlPanel.assertTurn1(true)
    await controlPanel.resetTurn()
    controlPanel.assertTurn1()
  })

  test('Reset, revert, reset to beginning of previous turn', async () => {
    expect.hasAssertions()

    const { controlPanel, agentsDataGrid } = renderApp(false)

    controlPanel.assertNoGameSession()
    await controlPanel.advance1Turn()
    controlPanel.assertTurn1()
    await agentsDataGrid.hireAgent()
    controlPanel.assertTurn1(true)
    await controlPanel.advance1Turn()
    controlPanel.assertTurn2()
    await agentsDataGrid.hireAgent()
    controlPanel.assertTurn2(true)
    // Now we start resetting and reverting
    await controlPanel.resetTurn()
    controlPanel.assertTurn2()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1(true)
    await controlPanel.resetTurn()
    controlPanel.assertTurn1(false)
  })

  test.todo('Revert to beginning of previous turn')
})
