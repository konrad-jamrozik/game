import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Label } from '../../src/components/utilities/Label.tsx'

describe('describe Label', () => {
  // eslint-disable-next-line vitest/no-disabled-tests
  test.skip('test Label', () => {
    expect.hasAssertions()
    render(<Label>Test Label</Label>)

    const labelElement: HTMLElement = screen.getByText('Test Label')
    expect(labelElement).toBeInTheDocument()
    expect(labelElement).toHaveTextContent('Test Label')
  })
})
