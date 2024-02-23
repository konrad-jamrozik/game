import { Button, Card, CardContent, CardHeader, Switch } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import type { Settings } from '../../main'
import { Label } from '../Label'

export type SettingsPanelProps = {
  introEnabled: boolean
  setIntroEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

export function SettingsPanel(props: SettingsPanelProps): React.JSX.Element {
  const [checked, setChecked] = useState<boolean>(props.introEnabled)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setChecked(event.target.checked)
    props.setIntroEnabled(event.target.checked)

    // kja dedup logic processing local storage
    const settings = loadSettings()
    const newSettings = {
      ...settings,
      introEnabled: event.target.checked,
    }
    localStorage.setItem('settings', JSON.stringify(newSettings))
  }

  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: '0px' }} />
      <CardContent sx={{ padding: '14px', maxWidth: '250px' }}>
        <Grid container spacing={1}>
          <Grid
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              //backgroundColor: 'rgb(64, 0, 0)',
            }}
          >
            <Label typographyVariant="body1">Show intro</Label>
            <Switch checked={checked} onChange={handleChange} />
          </Grid>
          <Grid
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              //backgroundColor: 'rgb(64, 0, 0)',
            }}
          >
            <Label typographyVariant="body1">Placeholder label</Label>
            <Switch checked={false} />
          </Grid>
          <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                localStorage.clear()
              }}
            >
              Clear local storage
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// kja dedup with loadSettings in web/src/main.ts
function loadSettings(): Settings {
  const storedSettingsString: string | null = localStorage.getItem('settings')
  if (!_.isNil(storedSettingsString)) {
    const settings: Settings = JSON.parse(storedSettingsString) as Settings
    console.log('Loaded settings from local storage', settings)
    return settings
    // eslint-disable-next-line no-else-return
  } else {
    console.log('No settings found in local storage. Using default settings.')

    return { introEnabled: true }
  }
}
