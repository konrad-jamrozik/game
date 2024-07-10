import _ from 'lodash'

export function median(numbers: number[]): number {
  if (numbers.length === 0) {
    console.error('median() got empty array as input!')
    return 0
  }

  const sorted = _.sortBy(numbers)
  const middleIndex = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middleIndex - 1]! + sorted[middleIndex]!) / 2
    : sorted[middleIndex]!
}

export function str(array: (string | number)[]): string {
  return `[${array.join(', ')}]`
}

export function never(): never {
  throw new Error(`Never invoked. This should never happen.`)
}
