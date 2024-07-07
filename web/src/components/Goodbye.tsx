import { useEffect } from 'react'
import { useGameSessionContext } from '../lib/gameSession/GameSession'

// https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
// Better alternative: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
function GoodbyeComponent(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      console.log('goodbye from GoodbyeComponent')
      gameSession.goodbye()

      // Uncomment the next line if you want to show a confirmation dialog
      // event.returnValue = 'Are you sure you want to leave?'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // This is a clean-up function per:
    // https://react.dev/reference/react/useEffect#connecting-to-an-external-system
    // https://react.dev/learn/synchronizing-with-effects#unmount
    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  return <div></div>
}

export default GoodbyeComponent
