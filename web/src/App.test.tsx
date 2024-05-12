/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-statements */
/* eslint-disable vitest/max-expects */
import { render, screen } from '@testing-library/react'
import { type UserEvent, userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import App from './App'
import { GameSessionProvider } from './components/GameSessionProvider'

describe('describe App', () => {
  test('test App', async () => {
    expect.hasAssertions()

    const user: UserEvent = userEvent.setup()

    render(
      <GameSessionProvider storedGameSessionData={undefined}>
        <App settings={{ introEnabled: true, outroEnabled: true }} />
      </GameSessionProvider>,
    )

    const introDialogHeader: HTMLElement = screen.getByText('Situation Report')
    expect(introDialogHeader).toBeVisible()

    console.log('clicking I accept the responsibility')
    await user.click(screen.getByText('I accept the responsibility'))

    expect(introDialogHeader).not.toBeVisible()

    const gameSessionHeader: HTMLElement = screen.getByText('Game Session')
    expect(gameSessionHeader).toBeInTheDocument()

    const resetGame: HTMLElement = screen.getByText('Reset game')
    expect(resetGame).toBeDisabled()

    expect(screen.getByText('Current turn: N/A')).toBeInTheDocument()

    console.log('clicking Advance 1 turn')
    await user.click(screen.getByText('Advance 1 turn'))

    await screen.findByText('Current turn: 1', undefined, { timeout: 3000 })
    expect(screen.getByText('Current turn: 1')).toBeInTheDocument()

    expect(resetGame).toBeEnabled()
    expect(introDialogHeader).not.toBeVisible()
    console.log('clicking Reset game')
    await user.click(screen.getByText('Reset game'))
    console.log('finding situation report')
    await screen.findByText('Situation Report', undefined, { timeout: 3000 })
    console.log('asserting')
    expect(screen.getByText('Situation Report')).toBeVisible()
  })
})

// function click(text: string): void {
//   const element: HTMLElement = screen.getByText(text)
//   expect(element).toBeInTheDocument()
//   element.click()
// }
