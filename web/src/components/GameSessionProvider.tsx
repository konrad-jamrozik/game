import { createContext } from 'react'
import { type GameSession, useGameSession } from '../lib/GameSession'
import type { GameSessionDataType } from '../lib/GameSessionData'

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
export const GameSessionContext = createContext<GameSession>(undefined!)

export type GameSessionProviderProps = {
  children: React.ReactNode
  storedGameSessionData: GameSessionDataType | undefined
}
export function GameSessionProvider(
  props: GameSessionProviderProps,
): React.JSX.Element {
  console.log(`render GameSessionProvider.tsx`)
  const gameSession = useGameSession(props.storedGameSessionData)
  return (
    <GameSessionContext.Provider value={gameSession}>
      {props.children}
    </GameSessionContext.Provider>
  )
}
