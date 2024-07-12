import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Faction } from '../../lib/codesync/GameState'
import { factionNameGridColDef } from '../../lib/rendering/renderFactions'
import ManageFactionDialog from './ManageFactionDialog'

export type FactionRow = {
  readonly id: number
  readonly faction: string
  readonly power: number
  readonly intel: number
}

export function getRows(factions: Faction[]): FactionRow[] {
  return _.map(factions, (faction: Faction) => ({
    id: faction.Id,
    faction: faction.Name,
    power: Math.round(faction.Power),
    intel: faction.IntelInvested,
  }))
}

export function getColumns(factions: Faction[]): GridColDef<FactionRow>[] {
  return [
    factionNameGridColDef,
    {
      field: 'power',
      headerName: 'Power',
      width: 110,
      disableColumnMenu: true,
    },
    {
      field: 'intel',
      headerName: 'Intel',
      width: 80,
      disableColumnMenu: true,
    },
    {
      field: 'deploy',
      disableColumnMenu: true,
      sortable: false,
      headerName: '',
      width: 90,
      renderCell: (
        params: GridRenderCellParams<FactionRow>,
      ): React.JSX.Element => {
        const row: FactionRow = params.row

        const faction: Faction = _.find(factions, {
          Id: row.id,
        })!
        return <ManageFactionDialog faction={faction} />
      },
    },
  ]
}
