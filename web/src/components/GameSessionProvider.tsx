import { createContext, useContext } from 'react'
import { type GameSession, useGameSession } from '../lib/GameSession'

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
const GameSessionContext = createContext<GameSession>(undefined!)

// eslint-disable-next-line react-refresh/only-export-components
export function useGameSessionContext(): GameSession {
  return useContext(GameSessionContext)
}

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
