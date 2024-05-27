/* eslint-disable unicorn/filename-case */
/* eslint-disable vitest/prefer-expect-assertions */
import { describe, test } from 'vitest'
import type { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for delegating turns to AI', () => {
  test('Delegate 1 turn to AI from uninitialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.clickDelegateTurnToAi()
    controlPanel.assertTurn1()
  })

  test('Delegate 1 turn to AI from initialized game session', async () => {
    const controlPanel = setupTest()
    await controlPanel.advance1Turn()
    controlPanel.assertTurn1()
    await controlPanel.clickDelegateTurnToAi()
    controlPanel.assertTurn(2)
  })

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

  // This test aims to cover: GameSessionControlPanel.tsc / resolveStartAndTargetTurn
  test('Delegate turns to AI - boundary cases', async () => {
    const controlPanel = setupTest()
    await controlPanel.delegateTurnsToAi(1, 5)
    await controlPanel.delegateTurnsToAi(4, 5)
    await controlPanel.delegateTurnsToAi(5, 6)
    await controlPanel.delegateTurnsToAi(3, 4)
    await controlPanel.delegateTurnsToAi(6, 7)
  })
})

function setupTest(): GameSessionControlPanelFixture {
  const { controlPanel } = renderApp(false)
  controlPanel.assertNoGameSession()
  return controlPanel
}
