import type { GameSessionDataType } from '../gameSession/GameSessionData'

export type StoredDataType = {
  readonly settings: SettingsType
  readonly gameSessionData?: GameSessionDataType | undefined
}

export type SettingsType = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
  readonly chartsEnabled: boolean
}

export function getDefaultSettings(): SettingsType {
  return {
    introEnabled: true,
    outroEnabled: true,
    chartsEnabled: true,
  }
}

export type StoredDataTypeName = 'gameSessionData' | 'settings'

export type StoredDataTypeMap = {
  [key in StoredDataTypeName]: SettingsType | GameSessionDataType
} & {
  gameSessionData: GameSessionDataType
  settings: SettingsType
}
