/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import { clickElement, getElementCheckState } from '../test_lib/testUtils'

export class SettingsPanelFixture {
  public async disableIntro(): Promise<void> {
    await clickElement('checkbox', 'Intro enabled')
    this.assertIntroEnabled(false)
  }

  public async enableIntro(): Promise<void> {
    await clickElement('checkbox', 'Intro enabled')
    this.assertIntroEnabled(true)
  }

  public async disableOutro(): Promise<void> {
    await clickElement('checkbox', 'Outro enabled')
    this.assertOutroEnabled(false)
  }

  public assertIntroEnabled(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Intro enabled', isChecked)
  }

  public assertOutroEnabled(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Outro enabled', isChecked)
  }
}
