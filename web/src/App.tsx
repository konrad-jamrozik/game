import { useState } from 'react'

import { RunSimulation, SimulationOutputTable } from './components'
import type { Agent } from './types/GameStatePlayerView'

export default function App(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([
    { Id: 42, CurrentState: 'Happy', TurnHired: 66 },
  ])
  const [turnLimit, setTurnLimit] = useState<number>(1)
  return (
    <>
      <RunSimulation {...{ agents, setAgents, turnLimit, setTurnLimit }} />
      <SimulationOutputTable agents={agents} />
    </>
  )
}
