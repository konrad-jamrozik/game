/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Label } from './Label.tsx'

test('Label', () => {
  render(<Label>Test Label</Label>)

  const labelElement = screen.getByText('Test Label')
  expect(labelElement).toBeInTheDocument()
  expect(labelElement.textContent).toBe('Test Label')
})
