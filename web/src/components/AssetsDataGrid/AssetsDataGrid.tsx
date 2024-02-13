import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { renderAssetNameCell } from '../../lib/rendering'
import { defaultComponentMinWidth } from '../../lib/utils'
import type { Assets } from '../../types/GameState'
import TransportCapMgmtDialog from './TransportCapMgmtDialog'

export type AssetsDataGridProps = {
  readonly assets: Assets | undefined
}

const tableHeight = 310

export function AssetsDataGrid(props: AssetsDataGridProps): React.JSX.Element {
  const rows: AssetRow[] = getRows(props.assets)

  return (
    <Box
      sx={{
        height: tableHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 292,
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        getRowId={(row: AssetRow) => row.name}
        columns={columns(
          props.assets?.Money,
          props.assets?.MaxTransportCapacity,
        )}
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

function columns(money?: number, maxTransportCapacity?: number): GridColDef[] {
  return [
    {
      field: 'name',
      headerName: 'Asset',
      disableColumnMenu: true,
      sortable: false,
      width: 100,
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

        // Note: we can assume here that money and maxTransportCapacity are defined
        // because if we are able to display this dialog, it means the button for it
        // was available to click, which means there is at least one game state which
        // has these values defined.
        return isManageable ? (
          <TransportCapMgmtDialog
            rowName={row.name}
            money={money!}
            maxTransportCapacity={maxTransportCapacity!}
          />
        ) : undefined
      },
    },
  ]
}

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
        { name: 'Agents', value: assets.Agents.length },
      ]
    : []
}
