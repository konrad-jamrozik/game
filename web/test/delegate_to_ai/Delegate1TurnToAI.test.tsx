/* eslint-disable unicorn/filename-case */
/* eslint-disable vitest/prefer-expect-assertions */
import { describe, test } from 'vitest'
import type { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for "Delegate 1 turn to AI"', () => {
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
})

function setupTest(): GameSessionControlPanelFixture {
  const { controlPanel } = renderApp(false)
  controlPanel.assertNoGameSession()
  return controlPanel
}
