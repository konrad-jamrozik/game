import { useState } from 'react'

import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
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
  const [count, setCount] = useState(0)

  return (
    <>
      <PrototypeApiCall agents={agents} setAgents={setAgents} />
      <PrototypeMuiButton />
      <PrototypeMuiTable agents={agents} />
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            setCount((cnt) => cnt + 1)
          }}
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
