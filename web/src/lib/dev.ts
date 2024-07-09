import _ from 'lodash'

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

// kja 2 use instead console.time() / timeLog() / timeEnd()
// https://medium.com/nmc-techblog/advanced-console-log-tips-tricks-fa3762930bca
export function startTiming(): void {
  timestamp = performance.now() // Start timing
}

export function measureTiming(): string {
  return seconds(performance.now() - timestamp)
}
