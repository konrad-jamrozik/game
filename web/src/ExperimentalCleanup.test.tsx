/* eslint-disable testing-library/prefer-screen-queries */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable testing-library/render-result-naming-convention */
/* eslint-disable vitest/prefer-expect-assertions */
import { RenderResult, getByText, render, screen } from '@testing-library/react'
import _ from 'lodash'
import { describe, test } from 'vitest'
import { Label } from './components/Label'

describe('Cleanup test', () => {
  test('Render 1', () => {
    const renderResult = renderLabel()
    //getByText(renderResult.container, 'foo')
    screen.getByText('foo')
  })

  test('Render 2', () => {
    const renderResult = renderLabel()
    //getByText(renderResult.container, 'foo')
    screen.getByText('foo')
  })
})

function renderLabel(): RenderResult {
  const renderResult: RenderResult = render(<Label>foo</Label>)
  return renderResult
}
