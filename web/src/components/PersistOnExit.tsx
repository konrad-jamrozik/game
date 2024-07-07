import { useEffect } from 'react'
import {
  type GameSession,
  useGameSessionContext,
} from '../lib/gameSession/GameSession'
import { useSettingsContext, type Settings } from '../lib/settings/Settings'

// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
// Worse alternative: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
export default function PersistOnExit(): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const settings: Settings = useSettingsContext()
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        console.log('PersistOnExit() effect triggered')
        gameSession.persistOnExit()
        settings.persistOnExit()
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
