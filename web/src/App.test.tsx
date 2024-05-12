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
    expect(introDialogHeader).toBeInTheDocument()

    console.log('clicking I accept the responsibility')
    await user.click(screen.getByText('I accept the responsibility'))

    // click('I accept the responsibility')

    // const introDialogHeader2: HTMLElement = screen.getByText('Situation Report')
    // expect(introDialogHeader).not.toBeInTheDocument()
    // expect(introDialogHeader2).not.toBeInTheDocument()

    const gameSessionHeader: HTMLElement = screen.getByText('Game Session')
    expect(gameSessionHeader).toBeInTheDocument()

    const resetGame: HTMLElement = screen.getByText('Reset game')
    expect(resetGame).toBeDisabled()

    expect(screen.getByText('Current turn: N/A')).toBeInTheDocument()

    console.log('clicking Advance 1 turn')
    await user.click(screen.getByText('Advance 1 turn'))
    // kja https://stackoverflow.com/questions/60986519/jest-react-testing-library-wait-for-a-mocked-async-function-to-complete
    // await wait(2000);

    // introEnabled: true, showIntro: false

    await screen.findByText('Current turn: 1', undefined, { timeout: 3000 })
    expect(screen.getByText('Current turn: 1')).toBeInTheDocument()

    expect(screen.getByText('Reset game')).toBeEnabled()
  })
})

// function click(text: string): void {
//   const element: HTMLElement = screen.getByText(text)
//   expect(element).toBeInTheDocument()
//   element.click()
// }
