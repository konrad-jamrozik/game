import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { userEvent, type UserEvent } from '@testing-library/user-event'
import { assert } from 'chai'
import _ from 'lodash'
import { expect } from 'vitest'
import { getHost } from '../../src/lib/api/genericApiUtils'

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
  expectElementWithText(text, 'P', htmlElementVisibility ?? 'present')
}

export function expectDiv(
  text: string,
  htmlElementVisibility?: HTMLElementVisibility,
): void {
  expectElementWithText(text, 'DIV', htmlElementVisibility ?? 'present')
}

export function expectHeader2(
  text: string,
  htmlElementVisibility?: HTMLElementVisibility,
  waitForElement = false,
): void {
  expectElementWithText(
    text,
    'H2',
    htmlElementVisibility ?? 'present',
    waitForElement,
  )
}

export function expectElementWithText(
  text: string,
  htmlTagName: string,
  htmlElementVisibility: HTMLElementVisibility,
  waitForElement = false,
): void {
  if (_.includes(presentStates, htmlElementVisibility)) {
    const htmlElement: HTMLElement | null = waitForElement
      ? screen.queryByText(text, { exact: false }) // https://testing-library.com/docs/queries/about/#precision
      : screen.getByText(text, { exact: false })

    expect(htmlElement).not.toBeNull()
    expect(htmlElement!.tagName).toBe(htmlTagName)
    expect(htmlElement).toBeInTheDocument()
    if (htmlElementVisibility === 'visible') {
      expect(htmlElement).toBeVisible()
    } else if (htmlElementVisibility === 'not visible') {
      expect(htmlElement).not.toBeVisible()
    }
  } else {
    expect(screen.queryByText(text, { exact: false })).not.toBeInTheDocument()
  }
}

export function getElementCheckState(
  role: string,
  name: string,
  isChecked: boolean,
): void {
  const htmlElement: HTMLElement = screen.getByRole(role, { name })
  if (isChecked) {
    expect(htmlElement).toBeChecked()
  } else {
    expect(htmlElement).not.toBeChecked()
  }
}

export function expectButtonToBeEnabled(name: string): void {
  expectButtonsToBeEnabled(name)
}

export function expectButtonsToBeEnabled(...names: string[]): void {
  expectButtonsToBe(names, true)
}

export function expectButtonToBeDisabled(name: string): void {
  expectButtonsToBeDisabled(name)
}

export function expectButtonsToBeDisabled(...names: string[]): void {
  expectButtonsToBe(names, false)
}

export function expectButtonsToBe(names: string[], enabled: boolean): void {
  for (const name of names) {
    const htmlElement: HTMLElement = screen.getByRole('button', { name })
    expect(htmlElement.tagName).toBe('BUTTON')
    if (enabled) {
      expect(htmlElement).toBeEnabled()
    } else {
      expect(htmlElement).toBeDisabled()
    }
  }
}

export async function clickButton(
  name: string,
  waitForName?: string,
): Promise<void> {
  expectButtonToBeEnabled(name)

  console.log(`----- CLICK BUTTON: '${name}' waitForName: '${waitForName}'`)
  await clickWithDelay(screen.getByRole('button', { name }))
  await waitForButtonToBeEnabled(waitForName ?? name)
  console.log(
    `----- CLICK BUTTON: '${name}' waitForName: '${waitForName}' DONE`,
  )
}

export async function waitForButtonToBeEnabled(name: string): Promise<void> {
  await waitFor(
    () => {
      expectButtonToBeEnabled(name)
    },
    {
      timeout: 5000,
    },
  )
}

export async function clickButtonAndWaitForItToDisappear(
  name: string,
): Promise<void> {
  await clickWithDelay(screen.getByRole('button', { name }))
  // This check is necessary because I was getting flaky error:
  // Error: The element(s) given to waitForElementToBeRemoved are already removed. waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.
  if (screen.queryByRole('button', { name }) !== null) {
    // https://testing-library.com/docs/guide-disappearance/#waiting-for-disappearance
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('button', { name }),
    )
  }
}

export async function clickElement(role: string, name: string): Promise<void> {
  console.log(`----- CLICK ELEMENT: '${role}' '${name}'`)
  await clickWithDelay(screen.getByRole(role, { name }))
  console.log(`----- CLICK ELEMENT: '${role}' '${name}' DONE`)
}

export async function typeIntoElement(
  role: string,
  name: string,
  content: string,
): Promise<void> {
  console.log(`----- TYPE INTO ELEMENT: '${role}' '${name}' '${content}'`)
  await typeWithDelay(screen.getByRole(role, { name }), content)
  console.log(`----- TYPE INTO ELEMENT: '${role}' '${name}' ' ${content}' DONE`)
}

/**
 * By default we delay some time after click to give React some time to disable buttons etc.
 */
const defaultClickDelayMs = 20

async function clickWithDelay(element: Element, ms?: number): Promise<void> {
  const user: UserEvent = userEvent.setup()
  await user.click(element)
  await delay(ms ?? defaultClickDelayMs)
}

async function typeWithDelay(
  element: Element,
  content: string,
  ms?: number,
): Promise<void> {
  const user: UserEvent = userEvent.setup()
  await user.clear(element)
  await user.type(element, content)
  await delay(ms ?? defaultClickDelayMs)
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
