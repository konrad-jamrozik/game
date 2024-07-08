import type { AIPlayerName } from '../../lib/codesync/aiPlayer'

export const aiPlayerOptionLabel: {
  [key in AIPlayerName]: string
} = {
  Basic: 'Basic',
  DoNothing: 'Do nothing',
}
