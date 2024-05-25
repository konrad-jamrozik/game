import type { GameSessionDataType } from '../GameSessionData'

export type StoredDataType = {
  readonly settings: SettingsType
  readonly gameSessionData?: GameSessionDataType | undefined
}

export type SettingsType = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
}

export type StoredDataTypeName = 'gameSessionData' | 'settings'

export type StoredDataTypeMap = {
  [key in StoredDataTypeName]: SettingsType | GameSessionDataType
} & {
  gameSessionData: GameSessionDataType
  settings: SettingsType
}
