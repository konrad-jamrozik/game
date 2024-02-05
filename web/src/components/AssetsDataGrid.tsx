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
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        sx={{
          '& .MuiDataGrid-footerContainer': {
            minHeight: '40px', // Reduce the height of the footer container
          },
        }}
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
  diff: number
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Asset',
    width: 170,
    renderCell: renderAssetNameCell,
  },
  {
    field: 'current',
    headerName: 'Current',
    width: defaultRowWidth,
  },
  {
    field: 'diff',
    headerName: 'Diff',
    width: defaultRowWidth,
  },
]

function getRows(assets?: Assets): AssetRow[] {
  return !_.isUndefined(assets)
    ? [
        { name: 'Money', current: assets.Money, diff: 0 },
        { name: 'Intel', current: assets.Intel, diff: 0 },
        { name: 'Support', current: assets.Support, diff: 0 },
        { name: 'Funding', current: assets.Funding, diff: 0 },
        {
          name: 'MaxTransportCapacity',
          current: assets.MaxTransportCapacity,
          diff: 0,
        },
        { name: 'Agents', current: assets.Agents.length, diff: 0 },
      ]
    : []
}
