/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import { clickElement, getElementCheckState } from '../testUtils'

export class SettingsPanelFixture {
  public async disableShowIntro(): Promise<void> {
    await clickElement('checkbox', 'Show Intro')
  }

  public async disableShowOutro(): Promise<void> {
    await clickElement('checkbox', 'Show Outro')
  }

  public assertShowIntro(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Show Intro', isChecked)
  }

  public assertShowOutro(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Show Outro', isChecked)
  }
}