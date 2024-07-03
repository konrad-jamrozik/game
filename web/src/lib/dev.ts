import _ from 'lodash'

// eslint-disable-next-line @typescript-eslint/init-declarations

export function seconds(milliseconds: number): string {
  const value = (Math.round(milliseconds) / 1000).toString()

  const [integer, decimal] = _.split(value, '.')

  // Ensure the integer part is padded to have a length of 3 (for example), so the dot is always at the same spot
  const paddedInteger = _.padStart(integer, 3, ' ')

  const paddedDecimal = _.padEnd(decimal, 3, '0')

  // Reconstruct the value with the padded integer part and the decimal part
  // Ensuring there's always one decimal digit
  const paddedValue = `${paddedInteger}.${paddedDecimal}`

  return paddedValue
}

let timestamp = 0

export function startTiming(): void {
  timestamp = performance.now() // Start timing
}

export function measureTiming(): string {
  return seconds(performance.now() - timestamp)
}
