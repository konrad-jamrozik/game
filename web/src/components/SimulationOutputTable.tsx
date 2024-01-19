import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import _ from 'lodash'

import type { Agent } from '../types/GameStatePlayerView'

export type SimulationOutputTableProps = {
  readonly agents: readonly Agent[]
}

export function SimulationOutputTable(
  props: SimulationOutputTableProps,
): React.JSX.Element {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 50 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Agent ID</TableCell>
            <TableCell align="right">Current State</TableCell>
            <TableCell align="right">Turn Hired</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.map(props.agents, (agent: Agent) => (
            <TableRow
              key={agent.Id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {agent.Id}
              </TableCell>
              <TableCell align="right">{agent.CurrentState}</TableCell>
              <TableCell align="right">{agent.TurnHired}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
