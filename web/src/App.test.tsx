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

    // kja https://stackoverflow.com/questions/52478069/node-fetch-disable-ssl-verification
    // IntroEnabled: true, showIntro: false
    // callApi() TRY: POST https://localhost:7128/advanceTurns?includeAllStates=true&turnLimit=1&delegateToAi=false
    // TypeError: fetch failed
    //     at node:internal/deps/undici/undici:12442:11
    //     at processTicksAndRejections (node:internal/process/task_queues:95:5)
    //     at Module.callApi (C:\Users\spawa\repos\game\web\src\lib\api\genericApiUtils.ts:38:32)
    //     at GameSession.advanceTurns (C:\Users\spawa\repos\game\web\src\lib\GameSession.ts:62:27)
    //     at advanceTurns (C:\Users\spawa\repos\game\web\src\components\GameSessionControlPanel\GameSessionControlPanel.tsx:49:30) {
    //   cause: Error: self-signed certificate
    //       at TLSSocket.onConnectSecure (node:_tls_wrap:1674:34)
    //       at TLSSocket.emit (node:events:519:28)
    //       at TLSSocket._finishInit (node:_tls_wrap:1085:8)
    //       at TLSWrap.ssl.onhandshakedone (node:_tls_wrap:871:12) {
    //     code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
    //   }
    // }
    // callApi() FINALLY: POST https://localhost:7128/advanceTurns?includeAllStates=true&turnLimit=1&delegateToAi=false
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
