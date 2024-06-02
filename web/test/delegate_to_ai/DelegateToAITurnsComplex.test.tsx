/* eslint-disable unicorn/filename-case */
/* eslint-disable vitest/prefer-expect-assertions */
import { describe, test } from 'vitest'
import type { GameSessionControlPanelFixture } from '../test_fixtures/GameSessionControlPanelFixture'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for delegating turns to AI', () => {
  // This test aims to cover: GameSessionControlPanel.tsx / resolveStartAndTargetTurn
  // future work: once the UI allows inspecting existing state history, assert here that states
  // were retained correctly.
  // This test actually managed to fail by AI causing the game session to be lost withing the few turns.
  // https://github.com/konrad-jamrozik/game/actions/runs/9264956219
  // Setting a random seed would fix it.
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
