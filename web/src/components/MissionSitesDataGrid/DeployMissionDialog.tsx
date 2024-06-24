import { Stack, Tooltip, type SxProps, type Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import type { GridRowId, GridRowSelectionModel } from '@mui/x-data-grid'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import type {
  Assets,
  Faction,
  MissionSite,
  MissionSiteModifiers,
} from '../../lib/codesync/GameState'
import { requiredSurvivingAgentsForSuccess } from '../../lib/codesync/ruleset'
import {
  useGameSessionContext,
  type GameSession,
} from '../../lib/gameSession/GameSession'
import { factionNameRenderMap } from '../../lib/rendering/renderFactions'
import { getSx } from '../../lib/rendering/renderUtils'
import { AgentsDataGrid } from '../AgentsDataGrid/AgentsDataGrid'
import { Label } from '../Label'

const missionDetailsGridMaxWidthPx = 400

export type DeployMissionDialogProps = {
  readonly missionSite: MissionSite | undefined
  readonly faction: Faction | undefined
}

export default function DeployMissionDialog(
  props: DeployMissionDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const assets = gameSession.getAssetsUnsafe()
  const [open, setOpen] = useState<boolean>(false)
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([])

  function handleOpen(): void {
    if (gameSession.isInitialized()) {
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

  return (
    <Fragment>
      <Button
        variant="text"
        color="primary"
        sx={{ padding: '0px' }}
        onClick={handleOpen}
      >
        Deploy
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth={false}
      >
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
            padding: '10px',
          }}
        >
          <Stack direction={'row'} spacing={2} alignItems={'flex-start'}>
            {missionDetailsGrid(props, assets)}
            {agentsGrid(
              props,
              gameSession,
              assets,
              rowSelectionModel,
              setRowSelectionModel,
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

function missionDetailsGrid(
  props: DeployMissionDialogProps,
  assets: Assets | undefined,
): React.JSX.Element {
  //   let myTuple: [string, number];
  // myTuple = ["Hello", 10]; // OK
  const entries = getMissionDetailsEntries(props, assets)
  // About react keys:
  // https://www.dhiwise.com/post/react-lists-and-keys-the-key-to-efficient-rendering#understanding-lists-in-react
  // https://react.dev/learn/rendering-lists
  return (
    <Grid
      container
      spacing={1}
      // bgcolor="rgba(100,200,100,0.2)"
      width={missionDetailsGridMaxWidthPx}
    >
      {_.map(entries, (entry, index) => (
        <Fragment key={index}>
          <Tooltip title="TODO">
            <Grid xs={8}>
              <Label sx={entry.labelSx ?? {}}>{entry.label}</Label>
            </Grid>
          </Tooltip>
          <Grid xs={4}>
            <Label sx={entry.valueSx ?? {}}>{entry.value}</Label>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  )
}

function agentsGrid(
  props: DeployMissionDialogProps,
  gameSession: GameSession,
  assets: Assets | undefined,
  rowSelectionModel: GridRowSelectionModel,
  setRowSelectionModel: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >,
): React.JSX.Element {
  async function handleLaunchMission(): Promise<void> {
    const selectedAgentsIds: number[] = _.map(
      rowSelectionModel,
      (id: GridRowId) => id as number,
    )
    await gameSession.launchMission(selectedAgentsIds, props.missionSite!.Id)
  }

  function getLaunchMissionButtonText(): [boolean, string] {
    if (_.isUndefined(props.missionSite)) {
      return [false, `ERROR: missionSite is undefined`]
    }
    if (!gameSession.isInitialized()) {
      return [false, `Game is not loaded`]
    }
    if (gameSession.isGameOver()) {
      return [false, `Game is over`]
    }
    const selectedAgents = rowSelectionModel.length
    const requiredAgents = requiredSurvivingAgentsForSuccess(props.missionSite)

    if (selectedAgents === 0) {
      return [false, 'Select agents to launch mission']
    }
    if (selectedAgents > assets!.CurrentTransportCapacity) {
      return [
        false,
        `Not enough capacity: ${selectedAgents} / ${assets!.CurrentTransportCapacity}`,
      ]
    }
    if (selectedAgents < requiredAgents) {
      return [
        false,
        `Not enough agents to succeed. Need at least ${requiredAgents}`,
      ]
    }

    return [true, `Launch mission with ${selectedAgents} agents`]
  }

  return (
    <Stack spacing={2} display="flex" alignItems="center">
      <AgentsDataGrid
        missionSiteToDeploy={props.missionSite}
        {...{ rowSelectionModel, setRowSelectionModel }}
      />
      <Button
        variant="contained"
        onClick={handleLaunchMission}
        disabled={!getLaunchMissionButtonText()[0]}
      >
        {getLaunchMissionButtonText()[1]}
      </Button>
    </Stack>
  )
}

type missionDetailsEntry = {
  label: string
  value: string | number | undefined
  labelSx?: SxProps<Theme>
  valueSx?: SxProps<Theme>
}

function getMissionDetailsEntries(
  props: DeployMissionDialogProps,
  assets: Assets | undefined,
): missionDetailsEntry[] {
  const renderedFactionName = factionNameRenderMap[props.faction!.Name].display
  const reqAgents = !_.isUndefined(props.missionSite)
    ? requiredSurvivingAgentsForSuccess(props.missionSite)
    : undefined

  const site: MissionSite | undefined = props.missionSite
  const mods: MissionSiteModifiers | undefined = site?.Modifiers
  const transportCap = `${assets?.CurrentTransportCapacity} / ${assets?.MaxTransportCapacity}`
  const powerClimbDamage = mods?.PowerIncreaseDamageReward

  // kja no point in testing for nulls: rewrite so that we can assume that 'site' and 'assets' are defined.
  // Review all UI components for this pattern.
  // future work: add support for tooltip. See MUI <Tooltip> doc.
  // prettier-ignore
  const entries: missionDetailsEntry[] = [
    { label: 'Mission site ID',               value: site?.Id             },
    { label: 'Faction',                       value: renderedFactionName,     valueSx: getSx(props.faction!.Name)        },
    { label: 'Difficulty',                    value: site?.Difficulty,        valueSx: getSx('Difficulty')               },
    { label: 'Required agents',               value: reqAgents,               valueSx: getSx('Requirement')              },
    { label: 'Available / Max transport cap', value: transportCap,            valueSx: getSx('CurrentTransportCapacity') },
    { label: 'Money reward',                  value: mods?.MoneyReward,       valueSx: getSx('Reward')                   },
    { label: 'Intel reward',                  value: mods?.IntelReward,       valueSx: getSx('Reward')                   },
    { label: 'Funding reward',                value: mods?.FundingReward,     valueSx: getSx('Reward')                   },
    { label: 'Support reward',                value: mods?.SupportReward,     valueSx: getSx('Reward')                   },
    { label: 'Faction damage',                value: mods?.PowerDamageReward, valueSx: getSx('Reward')                   },
    { label: 'Faction power climb damage',    value: powerClimbDamage,        valueSx: getSx('Reward')                   },    
    { label: 'Funding penalty',               value: mods?.FundingPenalty,    valueSx: getSx('Penalty')                  },
    { label: 'Support penalty',               value: mods?.SupportPenalty,    valueSx: getSx('Penalty')                  },
  ]

  return entries
}
