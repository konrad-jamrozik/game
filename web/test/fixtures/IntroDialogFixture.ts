/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import {
  type HTMLElementVisibility,
  expectHeader2,
  clickButton,
} from '../testUtils'

export class IntroDialogFixture {
  public async close(): Promise<void> {
    await clickButton('I accept the responsibility', 'Advance 1 turn')
  }

  public assertVisibility(htmlElementVisibility?: HTMLElementVisibility): void {
    expectHeader2('Situation Report', htmlElementVisibility)
  }
}
