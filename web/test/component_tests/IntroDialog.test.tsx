/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, test } from 'vitest'
import { renderApp } from '../test_lib/testComponentUtils'

describe('Test suite for IntroDialog.tsx', () => {
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
    // Then the intro dialog does not appear.
    await settingsPanel.disableShowIntro()
    await controlPanel.resetGame()
    introDialog.assertVisibility('not present')
  })

  test('Do not show intro upon resetting the game and enabling the setting', async () => {
    expect.hasAssertions()

    const { controlPanel, settingsPanel, introDialog } = renderApp(false)
    introDialog.assertVisibility('not present')
    await controlPanel.advance1Turn()
    await controlPanel.resetGame()
    introDialog.assertVisibility('not present')
    await settingsPanel.enableShowIntro()
    introDialog.assertVisibility('not present')
  })
})
