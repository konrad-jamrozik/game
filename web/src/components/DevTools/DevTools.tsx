/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import _ from 'lodash'
import { Profiler, StrictMode } from 'react'

const strict = false
const profile = true

export function DevTools({
  id,
  children,
}: {
  id: string
  children: React.JSX.Element
}): React.JSX.Element {
  if (profile && strict) {
    return (
      <StrictMode>
        <Profiler id={id} onRender={onRender}>
          {children}
        </Profiler>
      </StrictMode>
    )
  }
  if (profile && !strict) {
    return (
      <Profiler id={id} onRender={onRender}>
        {children}
      </Profiler>
    )
  }
  if (!profile && strict) {
    return <StrictMode>{children}</StrictMode>
  }
  return children
}

// https://react.dev/reference/react/Profiler#onrender-parameters
// eslint-disable-next-line @typescript-eslint/max-params
function onRender(
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
): void {
  console.log(
    `Profiler.onRender: id: ${_.padStart(id, 13)}, phase: ${_.padStart(phase, 13)}, ` +
      `actualDuration: ${seconds(actualDuration)}, baseDuration: ${seconds(baseDuration)}, ` +
      `startTime: ${seconds(startTime)}, commitTime: ${seconds(commitTime)}`,
  )
}

function seconds(milliseconds: number): string {
  const value = (Math.round(milliseconds / 100) / 10).toString()

  const [integer, decimal] = _.split(value, '.')

  // Ensure the integer part is padded to have a length of 3 (for example), so the dot is always at the same spot
  const paddedInteger = _.padStart(integer, 3, ' ')

  // Reconstruct the value with the padded integer part and the decimal part
  // Ensuring there's always one decimal digit
  const paddedValue = `${paddedInteger}.${(decimal ?? '') || '0'}`

  return paddedValue
}
