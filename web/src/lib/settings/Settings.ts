/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { SettingsContext } from '../../components/SettingsProvider'
import type { StoredData } from '../storedData/StoredData'

export type SettingsDataType = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
  readonly chartsEnabled: boolean
}

export const defaultSettingsData: SettingsDataType = {
  introEnabled: true,
  outroEnabled: true,
  chartsEnabled: true,
}

export function useSettingsContext(): Settings {
  return useContext(SettingsContext)
}

export function useSettings(storedData: StoredData): Settings {
  const storedSettingsData: SettingsDataType = storedData.getSettingsData()
  const [data, setData] = useState<SettingsDataType>(storedSettingsData)
  return new Settings(storedData, data, setData)
}

// kja curr work: use this
export class Settings {
  public constructor(
    private readonly storedData: StoredData,
    private readonly data: SettingsDataType,
    private readonly setData: React.Dispatch<
      React.SetStateAction<SettingsDataType>
    >,
  ) {}
}
