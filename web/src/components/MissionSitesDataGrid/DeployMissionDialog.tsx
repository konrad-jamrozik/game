import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import { useGameSessionContext, type GameSession } from '../../lib/GameSession'
import type { MissionSite } from '../../lib/GameState'
import { AgentsDataGrid } from '../AgentsDataGrid/AgentsDataGrid'

// kja rename to launch mission
export type DeployMissionDialogProps = {
  readonly missionSite: MissionSite
}

// kja need to distinguish between maxTransportCapacity and currentTransportCapacity
export default function DeployMissionDialog(
  props: DeployMissionDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const [open, setOpen] = useState<boolean>(false)
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([])

  function handleClickOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  async function handleLaunchMission(): Promise<void> {
    const selectedAgentsIds: number[] = _.map(
      rowSelectionModel,
      (id: GridRowId) => id as number,
    )

    // kja this will crash server if there are not enough agents to win the mission
    await gameSession.applyPlayerAction(
      'launchMission',
      selectedAgentsIds,
      props.missionSite.Id,
    )
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
            width: '440px',
            padding: '10px',
          }}
        >
          <Grid
            container
            spacing={1}
            // bgcolor="rgba(100,100,100,0.5)"
          >
            <Grid xs={12} display="flex" justifyContent="center">
              <AgentsDataGrid
                deploymentDisplay={true}
                {...{ rowSelectionModel, setRowSelectionModel }}
              />
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              <Button
                variant="contained"
                onClick={handleLaunchMission}
                disabled={
                  rowSelectionModel.length === 0 ||
                  rowSelectionModel.length >
                    gameSession.getCurrentState().Assets.MaxTransportCapacity
                }
              >
                {rowSelectionModel.length === 0
                  ? 'Select agents to launch mission'
                  : rowSelectionModel.length >
                      gameSession.getCurrentState().Assets.MaxTransportCapacity
                    ? `Too many agents selected`
                    : `Launch mission with ${rowSelectionModel.length} agents`}
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
