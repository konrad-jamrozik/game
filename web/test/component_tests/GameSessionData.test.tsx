/* eslint-disable sonarjs/no-duplicate-string */
import { cleanup } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'
import { verifyBackendApiIsReachable } from '../test_lib/testUtils'

// eslint-disable-next-line vitest/no-disabled-tests
describe('Test suite for GameSessionData.ts', () => {
  beforeAll(async () => {
    await verifyBackendApiIsReachable()
  })

  beforeEach(() => {
    // Needed per:
    // https://stackoverflow.com/questions/78493555/how-can-i-run-tests-in-a-single-file-in-parallel-when-using-screen-from-testin
    cleanup()
    localStorage.clear()
  })

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

  test('Revert to end of previous turn', async () => {
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
    await controlPanel.resetTurn()
    controlPanel.assertTurn2()
    await controlPanel.revert1Turn()
    controlPanel.assertTurn1(false)
  })

  // eslint-disable-next-line vitest/no-disabled-tests
  test.todo('Revert to beginning of previous turn')
  // See note in GameSessionData.ts / GameSessionDataType.resetGameState
})
