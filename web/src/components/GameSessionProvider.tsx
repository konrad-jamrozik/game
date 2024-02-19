import { createContext } from 'react'
import {
  type GameSession,
  useGameSession,
  type GameSessionData,
} from '../lib/GameSession'

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
export const GameSessionContext = createContext<GameSession>(undefined!)

export type GameSessionProviderProps = {
  children: React.ReactNode
  storedGameSessionData: GameSessionData | undefined
}
export function GameSessionProvider(
  props: GameSessionProviderProps,
): React.JSX.Element {
  const gameSession = useGameSession(props.storedGameSessionData)
  return (
    <GameSessionContext.Provider value={gameSession}>
      {props.children}
    </GameSessionContext.Provider>
  )
}
