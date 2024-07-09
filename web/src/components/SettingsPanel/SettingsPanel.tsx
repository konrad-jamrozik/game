/* eslint-disable max-lines-per-function */
import {
  Button,
  Card,
  CardHeader,
  Divider,
  List,
  ListItemText,
  Switch,
} from '@mui/material'
import type React from 'react'
import {
  useGameSessionContext,
  type GameSession,
} from '../../lib/gameSession/GameSession'
import { useSettingsContext, type Settings } from '../../lib/settings/Settings'
import { Label } from '../utilities/Label'
import { ListItemSx, ListItemWithSwitch } from './ListItemWithSwitch'

export function SettingsPanel(): React.JSX.Element {
  const settings: Settings = useSettingsContext()
  const gameSession: GameSession = useGameSessionContext()

  function handleIntroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.updateIntroEnabled(event.target.checked)
  }

  function handleOutroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.updateOutroEnabled(event.target.checked)
  }

  function handleChartsEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.updateChartsEnabled(event.target.checked)
  }

  function handleEventLogEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.updateEventLogEnabled(event.target.checked)
  }

  function handleMissionLogEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.updateMissionLogEnabled(event.target.checked)
  }

  // MUI "List and switch" components usage based on: https://mui.com/material-ui/react-list/#switch
  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: 1 }} />
      <List sx={{ width: '100%', maxWidth: 360, paddingTop: '0px' }}>
        <ListItemWithSwitch
          labelText="Intro enabled"
          checked={settings.introEnabled}
          onChange={handleIntroEnabledChange}
        />
        <ListItemWithSwitch
          labelText="Outro enabled"
          checked={settings.outroEnabled}
          onChange={handleOutroEnabledChange}
        />
        <ListItemWithSwitch
          labelText="Show mission log"
          checked={settings.missionLogEnabled}
          onChange={handleMissionLogEnabledChange}
        />
        <ListItemWithSwitch
          labelText="Show event log"
          checked={settings.eventLogEnabled}
          onChange={handleEventLogEnabledChange}
        />
        <ListItemWithSwitch
          labelText="Show charts"
          checked={settings.chartsEnabled}
          onChange={handleChartsEnabledChange}
        />
        <Divider sx={{ marginY: 1 }} />
        <ListItemSx>
          <ListItemText primary="Saved turn" />
          <Label sx={{ minWidth: 40, marginLeft: 2, textAlign: 'center' }}>
            {gameSession.savedTurn ?? 'N/A'}
          </Label>
        </ListItemSx>
        <ListItemSx>
          <ListItemText
            id="switch-list-saveOnExitEnabled"
            primary="Save on exit"
          />
          <Switch
            edge="end"
            disabled={true}
            checked={gameSession.getSaveOnExitEnabled()}
            inputProps={{
              'aria-labelledby': 'switch-list-saveOnExitEnabled',
            }}
          />
        </ListItemSx>
        <ListItemSx>
          <ListItemText
            id="switch-list-compressionEnabled"
            primary="Compress"
          />
          <Switch
            edge="end"
            disabled={true}
            checked={gameSession.getCompressionEnabled()}
            inputProps={{
              'aria-labelledby': 'switch-list-compressionEnabled',
            }}
          />
        </ListItemSx>
        <ListItemSx>
          <ListItemText primary="Data size" />
          <Label sx={{ minWidth: 92, marginLeft: 2, textAlign: 'center' }}>
            {formatSize(gameSession.getSize())}
          </Label>
        </ListItemSx>
        <Divider sx={{ marginY: 1 }} />
        <ListItemSx sx={{ justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              settings.reset()
            }}
          >
            Reset settings
          </Button>
        </ListItemSx>
      </List>
    </Card>
  )
}

function formatSize(length: number): string {
  if (length < 1000) {
    return length.toString()
  } else if (length < 1_000_000) {
    return `${(length / 1000).toFixed(3)} K`
  }
  return `${(length / 1_000_000).toFixed(3)} M`
}
