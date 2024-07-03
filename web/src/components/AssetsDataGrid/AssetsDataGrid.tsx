import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { useEffect } from 'react'
import type { Assets, GameState } from '../../lib/codesync/GameState'
import { getAssetTurnDiffEstimate } from '../../lib/codesync/ruleset'
import { measureTiming } from '../../lib/dev'
import {
  assetNameColors,
  assetNameGridColDef,
} from '../../lib/rendering/renderAssets'
import {
  defaultComponentMinWidth,
  sxClassesFromColors,
} from '../../lib/rendering/renderUtils'
import ManageTransportCapDialog from './ManageTransportCapDialog'

export type AssetsDataGridProps = {
  readonly currentGameState: GameState | undefined
}

const boxHeight = 280

export function AssetsDataGrid(props: AssetsDataGridProps): React.JSX.Element {
  console.log(`render AssetsDataGrid.tsx Elapsed: ${measureTiming()}`

  useEffect(() => {
    console.log(`render AssetsDataGrid.tsx: DONE. Elapsed: ${measureTiming()}`)
  })

  const rows: AssetRow[] = getRows(props.currentGameState)

  return (
    <Box
      sx={[
        {
          height: boxHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 407,
          width: '100%',
        },
        sxClassesFromColors(assetNameColors),
      ]}
    >
      <DataGrid
        rows={rows}
        getRowId={(row: AssetRow) => row.name}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooter={true}
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
  name: keyof Assets
  value: number
  estimate?: number | undefined
  isManageable?: boolean
}

const columns: GridColDef<AssetRow>[] = [
  assetNameGridColDef,
  {
    field: 'value',
    headerName: 'Value',
    disableColumnMenu: true,
    width: 90,
  },
  {
    field: 'estimate',
    headerName: 'Estimate',
    disableColumnMenu: true,
    width: 105,
    valueFormatter: (value?: number): string => {
      if (_.isUndefined(value)) {
        return ''
      }
      if (value > 0) {
        return `+${value}`
      }
      if (value < 0) {
        return `${value}`
      }
      return `~`
    },
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
        <ManageTransportCapDialog rowName={row.name} />
      ) : undefined
    },
  },
]

function getRows(gameState?: GameState): AssetRow[] {
  if (_.isUndefined(gameState)) {
    return []
  }
  const assets = gameState.Assets
  return [
    {
      name: 'Money',
      value: assets.Money,
      estimate: getAssetTurnDiffEstimate(gameState, 'Money'),
    },
    {
      name: 'Intel',
      value: assets.Intel,
      estimate: getAssetTurnDiffEstimate(gameState, 'Intel'),
    },
    {
      name: 'Support',
      value: assets.Support,
    },
    {
      name: 'Funding',
      value: assets.Funding,
    },
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
}
