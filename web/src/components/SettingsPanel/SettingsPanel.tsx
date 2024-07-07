/* eslint-disable max-lines-per-function */
import {
  Button,
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
} from '@mui/material'
import { useEffect, useState } from 'react'
import {
  type GameSession,
  useGameSessionContext,
} from '../../lib/gameSession/GameSession'
import { useSettingsContext, type Settings } from '../../lib/settings/Settings'
import { Label } from '../utilities/Label'

export function SettingsPanel(): React.JSX.Element {
  const settings: Settings = useSettingsContext()
  const gameSession: GameSession = useGameSessionContext()

  function handleIntroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setIntroEnabled(event.target.checked)
  }

  function handleOutroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setOutroEnabled(event.target.checked)
  }

  function handleChartsEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setChartsEnabled(event.target.checked)
  }

  function saveGameSession(): void {
    gameSession.save()
  }

  // MUI components usage based on: https://mui.com/material-ui/react-list/#switch
  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: '0px' }} />
      <List sx={{ width: '100%', maxWidth: 360, paddingTop: '0px' }}>
        <ListItem>
          <ListItemText id="switch-list-introEnabled" primary="Show intro" />
          <Switch
            edge="end"
            checked={settings.introEnabled}
            onChange={handleIntroEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-introEnabled',
            }}
          />
        </ListItem>
        <ListItem>
          <ListItemText id="switch-list-outroEnabled" primary="Show outro" />
          <Switch
            edge="end"
            checked={settings.outroEnabled}
            onChange={handleOutroEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-outroEnabled',
            }}
          />
        </ListItem>
        <ListItem>
          <ListItemText id="switch-list-chartsEnabled" primary="Show charts" />
          <Switch
            edge="end"
            checked={settings.chartsEnabled}
            onChange={handleChartsEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-chartsEnabled',
            }}
          />
        </ListItem>
        <Divider sx={{ marginY: 1 }} />

        <ListItem>
          <ListItemText primary="Saved turn" />
          <Label sx={{ minWidth: 40, marginLeft: 2, textAlign: 'center' }}>
            {gameSession.savedTurn ?? 'N/A'}
          </Label>
        </ListItem>
        <ListItem sx={{ justifyContent: 'center' }}>
          <Button onClick={saveGameSession} variant="outlined">
            Save game data
          </Button>
        </ListItem>
        <ListItem>
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
        </ListItem>
        <ListItem>
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
        </ListItem>
        <ListItem>
          <ListItemText primary="Data size" />
          <Label sx={{ minWidth: 92, marginLeft: 2, textAlign: 'center' }}>
            {formatSize(gameSession.getSize())}
          </Label>
        </ListItem>
        <Divider sx={{ marginY: 1 }} />
        <ListItem sx={{ justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              localStorage.clear()
              console.log('Cleared local storage')
            }}
          >
            Reset settings
          </Button>
        </ListItem>
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

// kja clear local storage no longer works, as the storage will be overridden on exit.
// Need to reset settings instead.
