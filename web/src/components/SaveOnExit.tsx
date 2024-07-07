import { useEffect } from 'react'
import {
  type GameSession,
  useGameSessionContext,
} from '../lib/gameSession/GameSession'
import { useSettingsContext, type Settings } from '../lib/settings/Settings'

// Note: SaveOnExit does not work if the data is to be compressed, as it runs too long. See:
// https://stackoverflow.com/questions/78716366/how-much-time-do-i-have-to-save-data-to-local-storage-when-browser-visibility-ch
//
// https://developer.chrome.com/docs/web-platform/page-lifecycle-api
// > Terminated
// > A page is in the terminated state once it has started being unloaded and cleared from memory by the browser. No new tasks can start in this state, and in-progress tasks may be killed if they run too long.
// Also:
// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#policies_in_place_to_aid_background_page_performance
// https://developer.mozilla.org/en-US/blog/using-the-page-visibility-api/

// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
// Worse alternative: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
// Read more at: https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
export default function SaveOnExit(): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const settings: Settings = useSettingsContext()
  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        console.log('SaveOnExit() effect triggered')
        settings.saveOnExit()
        if (gameSession.getSaveOnExitEnabled()) {
          gameSession.save()
        }
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
