/* eslint-disable @typescript-eslint/no-non-null-assertion */
import _ from 'lodash'

export type AtLeastOneNumber = [number, ...number[]]

export function median(numbers: AtLeastOneNumber): number {
  const sortedNumbers = _.sortBy(numbers) as AtLeastOneNumber
  const middleIndex = Math.floor(sortedNumbers.length / 2)

  return sortedNumbers.length % 2 === 0
    ? (sortedNumbers[middleIndex - 1]! + sortedNumbers[middleIndex]!) / 2
    : sortedNumbers[middleIndex]!
}
