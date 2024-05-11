// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Label } from './Label.tsx'

describe('describe Label', () => {
  test('test Label', () => {
    expect.hasAssertions()
    render(<Label>Test Label</Label>)

    const labelElement: HTMLElement = screen.getByText('Test Label')
    expect(labelElement).toBeInTheDocument()
    expect(labelElement).toHaveTextContent('Test Label')
  })
})
