import type { AIPlayerName } from '../../lib/codesync/aiPlayer'

export const aiPlayerOptionLabel: {
  [key in AIPlayerName]: string
} = {
  BasicAIPlayer: 'Basic',
  DoNothingAIPlayer: 'Do nothing',
}
