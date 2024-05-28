import _ from 'lodash'

export const defaultComponentHeight = 500

// In Chrome DevTools Settings / Devices:
// Legend: Width x Height (pixel ratio)
// Mobile S: 320px x _
// "My 15.6'' Razer laptop": 1536px x 695px
// "Pixel 5": 393px x 850px (2.75)
export const defaultComponentMinWidth = '250px'

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
