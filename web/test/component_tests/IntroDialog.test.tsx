import { cleanup } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'
import { verifyBackendApiIsReachable } from '../test_lib/testUtils'

describe('Test suite for IntroDialog.tsx', () => {
  beforeAll(async () => {
    await verifyBackendApiIsReachable()
  })

  beforeEach(() => {
    // Needed per:
    // https://stackoverflow.com/questions/78493555/how-can-i-run-tests-in-a-single-file-in-parallel-when-using-screen-from-testin
    cleanup()
  })

  test('Intro dialog and setting', async () => {
    expect.hasAssertions()

    // When the app is rendered with 'show intro' settings
    // Then:
    // - The intro dialog appears.
    // - The corresponding setting 'Show outro' setting is enabled.
    const { controlPanel, settingsPanel, introDialog } = renderApp(true)
    introDialog.assertVisibility('visible')
    await introDialog.close()
    settingsPanel.assertShowIntro(true)

    await controlPanel.advance1Turn()

    // When the game is reset when the 'show intro' setting is enabled.
    // Then the intro dialog appear.
    await controlPanel.resetGame()
    introDialog.assertVisibility('visible')

    await introDialog.close()
    await controlPanel.advance1Turn()

    // When the 'show intro' setting is disabled and then the game is reset.
    // Then the intro dialog appears.
    await settingsPanel.disableShowIntro()
    await controlPanel.resetGame()
    introDialog.assertVisibility('not present')
  })
})
