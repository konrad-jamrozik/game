/* eslint-disable max-lines-per-function */
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
import { getSx } from '../../lib/rendering'
import { requiredSurvivingAgentsForSuccess } from '../../lib/ruleset'
import { AgentsDataGrid } from '../AgentsDataGrid/AgentsDataGrid'
import { Label } from '../Label'

export type DeployMissionDialogProps = {
  readonly missionSite: MissionSite
}

export default function DeployMissionDialog(
  props: DeployMissionDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const assets = gameSession.getCurrentStateUnsafe()?.Assets
  const [open, setOpen] = useState<boolean>(false)
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([])

  function handleClickOpen(): void {
    if (gameSession.isLoaded()) {
      const stillAvailableAgents: GridRowId[] = _.filter(
        rowSelectionModel,
        (id: GridRowId) => _.some(assets?.Agents, (agent) => agent.Id === id),
      )
      if (stillAvailableAgents.length < rowSelectionModel.length) {
        setRowSelectionModel(stillAvailableAgents)
      }
    }

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

    await gameSession.applyPlayerAction(
      'launchMission',
      selectedAgentsIds,
      props.missionSite.Id,
    )
  }

  function getLaunchMissionButtonText(): [boolean, string] {
    const selectedAgents = rowSelectionModel.length
    const requiredAgents = requiredSurvivingAgentsForSuccess(props.missionSite)
    if (_.isUndefined(assets)) {
      return [false, `ERROR: Assets not loaded`]
    } else if (selectedAgents === 0) {
      return [false, 'Select agents to launch mission']
    } else if (selectedAgents > assets.CurrentTransportCapacity) {
      return [false, `Not enough available transport capacity`]
    } else if (selectedAgents < requiredAgents) {
      return [
        false,
        `Not enough agents to succeed. Need at least ${requiredAgents}`,
      ]
      // eslint-disable-next-line no-else-return
    } else {
      return [true, `Launch mission with ${selectedAgents} agents`]
    }
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
            width: '530px',
            padding: '10px',
          }}
        >
          <Grid
            container
            spacing={1}
            // bgcolor="rgba(100,100,100,0.5)"
          >
            <Grid xs={8}>
              <Label>Mission site ID</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{props.missionSite.Id}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('Difficulty')}>Mission site difficulty</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{props.missionSite.Difficulty}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('Difficulty')}>
                Required surviving agents for success
              </Label>
            </Grid>
            <Grid xs={4}>
              <Label>
                {requiredSurvivingAgentsForSuccess(props.missionSite)}
              </Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('MaxTransportCapacity')}>
                Max transport capacity
              </Label>
            </Grid>
            <Grid xs={4}>
              <Label>{assets?.MaxTransportCapacity}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('CurrentTransportCapacity')}>
                Current transport capacity
              </Label>
            </Grid>
            <Grid xs={4}>
              <Label>{assets?.CurrentTransportCapacity}</Label>
            </Grid>

            <Grid xs={12} display="flex" justifyContent="center">
              <AgentsDataGrid
                missionSiteToDeploy={props.missionSite}
                {...{ rowSelectionModel, setRowSelectionModel }}
              />
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              <Button
                variant="contained"
                onClick={handleLaunchMission}
                disabled={!getLaunchMissionButtonText()[0]}
              >
                {getLaunchMissionButtonText()[1]}
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
