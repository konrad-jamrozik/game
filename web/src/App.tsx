import { useState } from 'react'

import { RunSimulation, SimulationOutputTable } from './components'
import type { Agent } from './types/GameStatePlayerView'

export default function App(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([
    { Id: 42, CurrentState: 'Happy', TurnHired: 66 },
  ])
  return (
    <>
      <RunSimulation agents={agents} setAgents={setAgents} />
      <SimulationOutputTable agents={agents} />
    </>
  )
}
