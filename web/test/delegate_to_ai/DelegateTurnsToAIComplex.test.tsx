/* eslint-disable unicorn/filename-case */
/* eslint-disable vitest/prefer-expect-assertions */
import { describe, test } from 'vitest'
import type { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for delegating turns to AI', () => {
  // This test aims to cover: GameSessionControlPanel.tsx / resolveStartAndTargetTurn
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
