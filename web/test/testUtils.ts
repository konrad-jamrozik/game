import { screen, waitFor } from '@testing-library/react'
import { userEvent, type UserEvent } from '@testing-library/user-event'
import { assert } from 'chai'
import _ from 'lodash'
import { expect } from 'vitest'
import { getHost } from '../src/lib/api/genericApiUtils'

export type HTMLElementVisibility =
  | 'visible'
  | 'not visible'
  | 'present'
  | 'not present'

const presentStates: HTMLElementVisibility[] = [
  'present',
  'visible',
  'not visible',
]

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

export function expectParagraph(
  text: string,
  htmlElementVisibility?: HTMLElementVisibility,
): void {
  expectHtmlTagWithText(text, 'P', htmlElementVisibility ?? 'present')
}

export function expectHeader2(
  text: string,
  htmlElementVisibility?: HTMLElementVisibility,
): void {
  expectHtmlTagWithText(text, 'H2', htmlElementVisibility ?? 'present')
}

export function expectHtmlTagWithText(
  text: string,
  htmlTagName: string,
  htmlElementVisibility: HTMLElementVisibility,
): void {
  if (_.includes(presentStates, htmlElementVisibility)) {
    const htmlElement: HTMLElement = screen.getByText(text)
    expect(htmlElement.tagName).toBe(htmlTagName)
    expect(htmlElement).toBeInTheDocument()
    if (htmlElementVisibility === 'visible') {
      expect(htmlElement).toBeVisible()
    } else if (htmlElementVisibility === 'not visible') {
      expect(htmlElement).not.toBeVisible()
    }
  } else {
    expect(screen.queryByText(text)).not.toBeInTheDocument()
  }
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
