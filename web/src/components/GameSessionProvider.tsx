import { createContext } from 'react'
import {
  type GameSession,
  useGameSession,
} from '../lib/gameSession/GameSession'
import type { StoredData } from '../lib/storedData/StoredData'

// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context
export const GameSessionContext = createContext<GameSession>(undefined!)

export type GameSessionProviderProps = {
  children: React.JSX.Element
  storedData: StoredData
}

export function GameSessionProvider(
  props: GameSessionProviderProps,
): React.JSX.Element {
  const gameSession = useGameSession(props.storedData)
  return (
    <GameSessionContext.Provider value={gameSession}>
      {props.children}
    </GameSessionContext.Provider>
  )
}
