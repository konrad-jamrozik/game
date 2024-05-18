import { screen, waitFor } from '@testing-library/react'
import { userEvent, type UserEvent } from '@testing-library/user-event'
import { assert } from 'chai'
import { expect } from 'vitest'
import { getHost } from '../src/lib/api/genericApiUtils'

export async function verifyBackendApiIsReachable(): Promise<void> {
  const host: string = getHost()
  try {
    const response: Response = await fetch(getHost())
    assert.include([200, 404], response.status)
    console.log(
      `Backend API host '${host}' is reachable (status: ${response.status})`,
    )
  } catch {
    assert.fail(`Backend API host '${host}' is not reachable`)
  }
}

export function expectLabel(text: string): void {
  const htmlElement: HTMLElement = screen.getByText(text)
  expect(htmlElement.tagName).toBe('P')
  expect(htmlElement).toBeInTheDocument()
}

export function expectButtonToBeEnabled(text: string): void {
  expectButtonsToBeEnabled(text)
}

export function expectButtonsToBeEnabled(...texts: string[]): void {
  expectButtonsToBe(texts, true)
}

export function expectButtonToBeDisabled(text: string): void {
  expectButtonsToBeDisabled(text)
}

export function expectButtonsToBeDisabled(...texts: string[]): void {
  expectButtonsToBe(texts, false)
}

export function expectButtonsToBe(texts: string[], enabled: boolean): void {
  for (const text of texts) {
    const htmlElement: HTMLElement = screen.getByText(text)
    expect(htmlElement.tagName).toBe('BUTTON')
    if (enabled) {
      expect(htmlElement).toBeEnabled()
    } else {
      expect(htmlElement).toBeDisabled()
    }
  }
}

export async function clickButton(
  text: string,
  waitForText?: string,
): Promise<void> {
  expectButtonToBeEnabled(text)

  console.log(`----- CLICK BUTTON: '${text}'`)
  const user: UserEvent = userEvent.setup()
  await user.click(screen.getByText(text))
  await waitForButtonToBeEnabled(waitForText ?? text)
  console.log(`----- CLICK BUTTON: '${text}' DONE`)
}

export async function waitForButtonToBeEnabled(text: string): Promise<void> {
  await waitFor(
    () => {
      expectButtonToBeEnabled(text)
    },
    {
      timeout: 5000,
    },
  )
}
