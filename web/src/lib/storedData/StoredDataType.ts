import type { GameSessionDataType } from '../gameSession/GameSessionData'
import type { SettingsDataType } from '../settings/Settings'

export type StoredDataType = {
  readonly settings: SettingsDataType
  readonly gameSessionData?: GameSessionDataType | undefined
}

export type StoredDataTypeName = 'gameSessionData' | 'settingsData'

export type StoredDataTypeMap = {
  [key in StoredDataTypeName]: SettingsDataType | GameSessionDataType
} & {
  gameSessionData: GameSessionDataType
  settingsData: SettingsDataType
}
