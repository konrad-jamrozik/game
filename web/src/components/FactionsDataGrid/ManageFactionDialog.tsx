/* eslint-disable max-lines-per-function */
import { Stack, Typography, type SxProps, type Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import type { Faction } from '../../lib/codesync/GameState'
import { getNormalizedPower } from '../../lib/codesync/ruleset'
import {
  type GameSession,
  useGameSessionContext,
} from '../../lib/gameSession/GameSession'
import { factionNameRenderMap } from '../../lib/rendering/renderFactions'
import { getSx } from '../../lib/rendering/renderUtils'
import { Label } from '../Label'
import InputSlider from './InputSlider'

const factionDetailsGridMaxWidthPx = 400

export type ManageFactionDialogProps = {
  readonly faction: Faction
}

export default function DeployMissionDialog(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const [open, setOpen] = useState<boolean>(false)

  const gs = gameSession.getCurrentGameStateUnsafe()

  if (_.isUndefined(gs)) {
    return <></>
  }

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function investIntel(amount: number): void {
    console.log(`investIntel(${amount}) NOT IMPLEMENTED`)
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
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {factionDetailsGrid(props)}
            <Stack
              direction="column"
              spacing={1}
              display="flex"
              alignItems="center"
            >
              <InputSlider
                defaultValue={gs.Assets.Intel}
                onClick={async (intel: number) => {
                  await Promise.resolve()
                  investIntel(intel)
                }}
                minValue={0}
                maxValue={gs.Assets.Intel}
              />
              <InputSlider
                defaultValue={gs.Assets.Intel}
                onClick={async (intel: number) => {
                  await Promise.resolve()
                  investIntel(intel)
                }}
                minValue={0}
                maxValue={gs.Assets.Intel}
              />
            </Stack>
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
  const name = factionNameRenderMap[props.faction.Name].display
  const power = getNormalizedPower(props.faction)
  const intel = props.faction.IntelInvested

  // prettier-ignore
  const entries: FactionDetailsEntry[] = [
    { label: 'Faction', value: name,  valueSx: getSx(props.faction.Name) },
    { label: 'Power',   value: power, valueSx: getSx('Difficulty') },
    { label: 'Intel',   value: intel, valueSx: getSx('Intel') },
  ]

  return entries
}
