/* eslint-disable unicorn/filename-case */
import { describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for delegating turns to AI', () => {
  // kja Test: delegate turn to AI:
  // Always need to assert Result is undecided until I get seeds in
  // DONE From turn N/A: start 1 target 5
  // From turn 1: start 1 target 5
  // Then (from turn 5): start 1, target 5
  // Then (from turn 5): start 4, target 5
  // Then (from turn 5): start 5, target 6
  // Then (from turn 6): start 3, target 4
  // Then (from turn 4): start 6, target 7
  // But also just read and cover: resolveStartAndTargetTurn

  test('Delegate turns 1 to 5 from uninitialized game session', async () => {
    expect.hasAssertions()

    const { controlPanel } = renderApp(false)

    controlPanel.assertNoGameSession()
    await controlPanel.setTargetTurn(5)
    await controlPanel.delegateTurnsToAi()
    controlPanel.assertTurn(5)
  })
})
