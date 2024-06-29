import type { SxProps, Theme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { Fragment } from 'react/jsx-runtime'
import { getNormalizedPower } from '../../lib/codesync/ruleset'
import { factionNameRenderMap } from '../../lib/rendering/renderFactions'
import { getSx } from '../../lib/rendering/renderUtils'
import { Label } from '../utilities/Label'
import type { ManageFactionDialogProps } from './ManageFactionDialog'

const gridMaxWidthPx = 300

export function FactionDetails(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  const entries = getFactionDetailsEntries(props)
  return (
    <Grid
      container
      spacing={1}
      // bgcolor="rgba(100,200,100,0.2)"
      width={gridMaxWidthPx}
    >
      {_.map(entries, (entry, index) => (
        <Fragment key={index}>
          <Grid xs={6}>
            <Label sx={entry.labelSx ?? {}}>{entry.label}</Label>
          </Grid>
          <Grid xs={6}>
            <Label sx={entry.valueSx ?? {}}>{entry.value}</Label>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  )
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

type FactionDetailsEntry = {
  label: string
  value: string | number | undefined
  labelSx?: SxProps<Theme>
  valueSx?: SxProps<Theme>
}
