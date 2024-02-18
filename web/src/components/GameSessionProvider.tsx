import { createContext } from 'react'
import { type GameSession, useGameSession } from '../lib/GameSession'

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
export const GameSessionContext = createContext<GameSession>(undefined!)

export function GameSessionProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const gameSession = useGameSession()
  return (
    <GameSessionContext.Provider value={gameSession}>
      {children}
    </GameSessionContext.Provider>
  )
}
