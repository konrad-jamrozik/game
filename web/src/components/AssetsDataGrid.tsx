import { Box, Button } from '@mui/material'
import {
  DataGrid,
  type GridRenderCellParams,
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

export type AssetRow = {
  name: string
  value: number
  isManageable?: boolean
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Asset',
    width: defaultRowWidth,
    renderCell: renderAssetNameCell,
  },
  {
    field: 'value',
    headerName: 'Value',
    width: defaultRowWidth,
  },
  {
    field: 'isManageable',
    disableColumnMenu: true,
    sortable: false,
    headerName: '',
    width: 150,
    renderCell: (
      params: GridRenderCellParams<AssetRow, boolean | undefined>,
    ): React.JSX.Element | undefined => {
      const isManageable = Boolean(params.value)
      const row: AssetRow = params.row

      return isManageable ? (
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            console.log(`Clicked! ${JSON.stringify(row.name, undefined, 2)}`)
          }}
        >
          Manage
        </Button>
      ) : undefined
    },
  },
]

function getRows(assets?: Assets): AssetRow[] {
  return !_.isUndefined(assets)
    ? [
        { name: 'Money', value: assets.Money, isManageable: true },
        { name: 'Intel', value: assets.Intel, isManageable: true },
        { name: 'Support', value: assets.Support, isManageable: true },
        { name: 'Funding', value: assets.Funding },
        {
          name: 'MaxTransportCapacity',
          value: assets.MaxTransportCapacity,
          isManageable: true,
        },
        { name: 'Agents', value: assets.Agents.length, isManageable: true },
      ]
    : []
}
