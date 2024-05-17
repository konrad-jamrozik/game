/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable testing-library/render-result-naming-convention */
/* eslint-disable vitest/prefer-expect-assertions */
import { render, getByText } from '@testing-library/react'
import { describe, test } from 'vitest'

describe('Parallelism test', () => {
  test('Render 1', () => {
    const renderResult = render(<div>foo</div>)
    getByText(renderResult.container, 'foo')
  })

  test('Render 2', () => {
    const renderResult = render(<div>foo</div>)
    getByText(renderResult.container, 'foo')
  })
})
