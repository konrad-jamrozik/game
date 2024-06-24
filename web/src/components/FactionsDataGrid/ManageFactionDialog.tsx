import {
  Grid,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import type { Faction } from '../../lib/codesync/GameState'
import { factionNameRenderMap } from '../../lib/rendering/renderFactions'
import { getSx } from '../../lib/rendering/renderUtils'
import { Label } from '../Label'

const factionDetailsGridMaxWidthPx = 400
export type ManageFactionDialogProps = {
  readonly faction: Faction
}

export default function DeployMissionDialog(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  // const gameSession: GameSession = useGameSessionContext()
  const [open, setOpen] = useState<boolean>(false)

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  const factionNameSx: SxProps<Theme> = [
    getSx(props.faction.Name),
    {
      fontWeight: 'bold',
      borderRadius: '20px',
      paddingX: '12px',
      backgroundColor: '#000',
    },
  ]
  return (
    <Fragment>
      <Button
        variant="text"
        color="primary"
        sx={{ padding: '0px' }}
        onClick={handleOpen}
      >
        Manage
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
          Manage&nbsp;
          <Typography variant="inherit" sx={factionNameSx}>
            {` ${props.faction.Name} `}
          </Typography>
          &nbsp;faction
        </DialogTitle>
        <DialogContent
          sx={{
            // bgcolor: '#205050',
            padding: '10px',
          }}
        >
          <Stack direction={'row'} spacing={2} alignItems={'flex-start'}>
            {factionDetailsGrid(props)}
            {factionDetailsGrid(props)}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

function factionDetailsGrid(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  const entries = getFactionDetailsEntries(props)
  return (
    <Grid
      container
      spacing={1}
      // bgcolor="rgba(100,200,100,0.2)"
      width={factionDetailsGridMaxWidthPx}
    >
      {_.map(entries, (entry, index) => (
        <Fragment key={index}>
          <Grid xs={8}>
            <Label sx={entry.labelSx ?? {}}>{entry.label}</Label>
          </Grid>
          <Grid xs={4}>
            <Label sx={entry.valueSx ?? {}}>{entry.value}</Label>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  )
}

type FactionDetailsEntry = {
  label: string
  value: string | number | undefined
  labelSx?: SxProps<Theme>
  valueSx?: SxProps<Theme>
}

function getFactionDetailsEntries(
  props: ManageFactionDialogProps,
): FactionDetailsEntry[] {
  const renderedFactionName = factionNameRenderMap[props.faction.Name].display

  // kja no point in testing for nulls: rewrite so that we can assume that 'site' and 'assets' are defined.
  // Review all UI components for this pattern.
  // prettier-ignore
  const entries: FactionDetailsEntry[] = [
    { label: 'Faction',                       value: renderedFactionName,     valueSx: getSx(props.faction.Name)        },
  ]

  return entries
}
