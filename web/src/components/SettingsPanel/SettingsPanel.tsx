/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable max-lines */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useGameSessionContext } from '../../lib/GameSession'
import { Label } from '../Label'

export type SettingsPanelProps = Record<string, never>

export function SettingsPanel(props: SettingsPanelProps): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const theme = useTheme()
  const smallDisplay = useMediaQuery(theme.breakpoints.down('sm'))
  const textFieldWidth = smallDisplay ? 64 : 90
  console.log(`GameSessionControlPanel:`, gameSession, props, textFieldWidth)

  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: '0px' }} />
      <CardContent sx={{ padding: '14px' }}>
        <Grid container spacing={1}>
          <Grid container sx={{ minWidth: '256px' }}>
            <Grid
              xs={8}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Label typographyVariant="body1">Show intro pop-up</Label>
            </Grid>
            <Grid
              xs={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Switch />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
