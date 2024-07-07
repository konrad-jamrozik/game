import { useEffect } from 'react'
import { useGameSessionContext } from '../lib/gameSession/GameSession'

// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
// Worse alternative: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
export default function Goodbye(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        console.log('goodbye from Goodbye')
        gameSession.goodbye()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // This is a clean-up function per:
    // https://react.dev/reference/react/useEffect#connecting-to-an-external-system
    // https://react.dev/learn/synchronizing-with-effects#unmount
    return (): void => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  return <div></div>
}
