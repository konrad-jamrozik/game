import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { Assets } from '../../lib/GameState'
import { renderAssetNameCell } from '../../lib/rendering'
import { defaultComponentMinWidth } from '../../lib/utils'
import TransportCapMgmtDialog from './TransportCapMgmtDialog'

export type AssetsDataGridProps = {
  readonly assets: Assets | undefined
}

const tableHeight = 330

export function AssetsDataGrid(props: AssetsDataGridProps): React.JSX.Element {
  const rows: AssetRow[] = getRows(props.assets)

  return (
    <Box
      sx={{
        height: tableHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 302,
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        getRowId={(row: AssetRow) => row.name}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooterPagination={true}
        sx={(theme) => ({ bgcolor: theme.palette.background.default })}
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
    disableColumnMenu: true,
    sortable: false,
    width: 110,
    renderCell: renderAssetNameCell,
  },
  {
    field: 'value',
    headerName: 'Value',
    disableColumnMenu: true,
    width: 90,
  },
  {
    field: 'isManageable',
    disableColumnMenu: true,
    sortable: false,
    headerName: '',
    width: 100,
    renderCell: (
      params: GridRenderCellParams<AssetRow, boolean | undefined>,
    ): React.JSX.Element | undefined => {
      const isManageable = Boolean(params.value)
      const row: AssetRow = params.row

      return isManageable ? (
        <TransportCapMgmtDialog rowName={row.name} />
      ) : undefined
    },
  },
]

function getRows(assets?: Assets): AssetRow[] {
  return !_.isUndefined(assets)
    ? [
        { name: 'Money', value: assets.Money },
        { name: 'Intel', value: assets.Intel },
        { name: 'Support', value: assets.Support },
        { name: 'Funding', value: assets.Funding },
        {
          name: 'MaxTransportCapacity',
          value: assets.MaxTransportCapacity,
          isManageable: true,
        },
        {
          name: 'CurrentTransportCapacity',
          value: assets.CurrentTransportCapacity,
        },
        { name: 'Agents', value: assets.Agents.length },
      ]
    : []
}
