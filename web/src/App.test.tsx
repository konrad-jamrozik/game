// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import App from './App'
import { GameSessionProvider } from './components/GameSessionProvider'

describe('describe App', () => {
  test('test App', () => {
    expect.hasAssertions()

    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    // https://vitest.dev/guide/mocking.html
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: unknown) => ({
        matches: false,
        media: query,
        onchange: undefined,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <GameSessionProvider storedGameSessionData={undefined}>
        <App settings={{ introEnabled: true, outroEnabled: true }} />
      </GameSessionProvider>,
    )

    const introDialogHeader: HTMLElement = screen.getByText('Situation Report')
    expect(introDialogHeader).toBeInTheDocument()
  })
})
