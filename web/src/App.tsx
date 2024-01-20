import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { RunSimulation, SimulationOutputTable } from './components'
import type { Agent } from './types/GameStatePlayerView'

function Footer(): React.JSX.Element {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Game by '}
      <Link color="inherit" href="https://github.com/konrad-jamrozik/">
        Konrad Jamrozik
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  )
}

export default function App(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([
    { Id: 42, CurrentState: 'Happy', TurnHired: 66 },
  ])
  const [turnLimit, setTurnLimit] = useState<number>(1)
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography gutterBottom>
          <>
            <RunSimulation
              {...{ agents, setAgents, turnLimit, setTurnLimit }}
            />
            <SimulationOutputTable agents={agents} />
          </>
        </Typography>
        <Footer />
      </Box>
    </Container>
  )
}
