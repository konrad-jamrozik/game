/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import { clickElement, getElementCheckState } from '../test_lib/testUtils'

export class SettingsPanelFixture {
  public async disableShowIntro(): Promise<void> {
    await clickElement('checkbox', 'Show intro')
    this.assertShowIntro(false)
  }

  public async enableShowIntro(): Promise<void> {
    await clickElement('checkbox', 'Show intro')
    this.assertShowIntro(true)
  }

  public async disableShowOutro(): Promise<void> {
    await clickElement('checkbox', 'Show outro')
    this.assertShowOutro(false)
  }

  public assertShowIntro(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Show intro', isChecked)
  }

  public assertShowOutro(isChecked: boolean): void {
    getElementCheckState('checkbox', 'Show outro', isChecked)
  }
}
