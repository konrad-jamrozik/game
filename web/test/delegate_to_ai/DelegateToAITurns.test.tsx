/* eslint-disable unicorn/filename-case */
/* eslint-disable vitest/prefer-expect-assertions */
import { describe, test } from 'vitest'
import type { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for delegating turns to AI', () => {
  test('Delegate turns 1 to 5 from uninitialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.delegateTurnsToAi(1, 5)
  })

  test('Delegate turns 2 to 5 from uninitialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.delegateTurnsToAi(2, 5)
  })

  test('Delegate turns 1 to 5 from initialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.advance1Turn()
    await controlPanel.delegateTurnsToAi(1, 5)
  })

  test('Delegate turns 2 to 5 from initialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.advance1Turn()
    await controlPanel.delegateTurnsToAi(2, 5)
  })

  test('Delegate turns 1 to 2 from uninitialized game session, twice', async () => {
    const controlPanel = setupTest()
    await controlPanel.delegateTurnsToAi(1, 2)
    await controlPanel.delegateTurnsToAi(1, 2)
    controlPanel.assertNoError()
  })
})

function setupTest(): GameSessionControlPanelFixture {
  const { controlPanel } = renderApp(false)
  controlPanel.assertNoGameSession()
  return controlPanel
}
