/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/max-params */
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
  const [introEnabled, setIntroEnabled] = useState<boolean>(
    storedSettingsData.introEnabled,
  )
  const [outroEnabled, setOutroEnabled] = useState<boolean>(
    storedSettingsData.outroEnabled,
  )
  const [chartsEnabled, setChartsEnabled] = useState<boolean>(
    storedSettingsData.chartsEnabled,
  )

  return new Settings(
    storedData,
    introEnabled,
    setIntroEnabled,
    outroEnabled,
    setOutroEnabled,
    chartsEnabled,
    setChartsEnabled,
  )
}

export class Settings {
  public constructor(
    private readonly storedData: StoredData,
    public readonly introEnabled: boolean,
    private readonly _setIntroEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    public readonly outroEnabled: boolean,
    private readonly _setOutroEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    public readonly chartsEnabled: boolean,
    private readonly _setChartsEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
  ) {}

  public setIntroEnabled(value: boolean): void {
    this.persistSettings({ introEnabled: value })
    this._setIntroEnabled(value)
  }
  public setOutroEnabled(value: boolean): void {
    this.persistSettings({ outroEnabled: value })
    this._setOutroEnabled(value)
  }

  public setChartsEnabled(value: boolean): void {
    this.persistSettings({ chartsEnabled: value })
    this._setChartsEnabled(value)
  }

  private persistSettings({
    introEnabled,
    outroEnabled,
    chartsEnabled,
  }: {
    introEnabled?: boolean
    outroEnabled?: boolean
    chartsEnabled?: boolean
  }): void {
    const newSettingsData: SettingsDataType = {
      introEnabled: introEnabled ?? this.introEnabled,
      outroEnabled: outroEnabled ?? this.outroEnabled,
      chartsEnabled: chartsEnabled ?? this.chartsEnabled,
    }
    this.storedData.persistSettingsData(newSettingsData)
  }
}
