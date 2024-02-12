import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import type { Agent, MissionSite } from '../types/GameState'
import { AgentsDataGrid } from './AgentsDataGrid/AgentsDataGrid'

export type DeployMissionDialogProps = {
  readonly agents: Agent[]
  readonly missionSite: MissionSite
}

export default function DeployMissionDialog(
  props: DeployMissionDialogProps,
): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false)

  function handleClickOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function handleLaunchMission(): void {
    console.log("Clicked 'launch mission'!")
  }

  return (
    <Fragment>
      <Button variant="text" color="primary" onClick={handleClickOpen}>
        Deploy
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          sx={{
            // bgcolor: '#603050',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {'Choose agents to deploy'}
        </DialogTitle>
        <DialogContent
          sx={{
            // bgcolor: '#205050',
            width: '400px',
            padding: '10px',
          }}
        >
          <Grid
            container
            spacing={1}
            // bgcolor="rgba(100,100,100,0.5)"
          >
            <Grid xs={12} display="flex" justifyContent="center">
              <AgentsDataGrid agents={props.agents} deploymentDisplay={true} />
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              <Button variant="contained" onClick={handleLaunchMission}>
                Launch mission
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
