import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { renderAssetNameCell } from '../lib/rendering'
import type { Assets } from '../types/GameState'

export type AssetsDataGridProps = {
  readonly assets: Assets | undefined
}

const tableHeight = 290
const defaultRowWidth = 110

export function AssetsDataGrid(props: AssetsDataGridProps): React.JSX.Element {
  const rows: AssetRow[] = getRows(props.assets)

  return (
    <Box sx={{ height: tableHeight, width: '100%' }}>
      <DataGrid
        rows={rows}
        getRowId={(row: AssetRow) => row.name}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooterPagination={true}
      />
    </Box>
  )
}

// https://mui.com/x/api/data-grid/data-grid/
function onRowSelectionModelChange(
  rowSelectionModel: GridRowSelectionModel,
  details: GridCallbackDetails,
): void {
  console.log('rowSelectionModel:', rowSelectionModel)
  console.log('details:', details)
}

type AssetRow = {
  name: string
  current: number
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Asset',
    width: defaultRowWidth,
    renderCell: renderAssetNameCell,
  },
  {
    field: 'current',
    headerName: 'Current',
    width: defaultRowWidth,
  },
]

function getRows(assets?: Assets): AssetRow[] {
  return !_.isUndefined(assets)
    ? [
        { name: 'Money', current: assets.Money },
        { name: 'Intel', current: assets.Intel },
        { name: 'Support', current: assets.Support },
        { name: 'Funding', current: assets.Funding },
        {
          name: 'MaxTransportCapacity',
          current: assets.MaxTransportCapacity,
        },
        { name: 'Agents', current: assets.Agents.length },
      ]
    : []
}
