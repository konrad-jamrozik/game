import { useState } from 'react'

import {
  PrototypeApiCall,
  PrototypeMuiButton,
  PrototypeMuiTable,
} from './components'
import type { Agent } from './types/GameStatePlayerView'

export default function App(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([
    { Id: 42, CurrentState: 'Happy', TurnHired: 66 },
  ])
  return (
    <>
      <PrototypeApiCall agents={agents} setAgents={setAgents} />
      <PrototypeMuiButton />
      <PrototypeMuiTable agents={agents} />
    </>
  )
}
