/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import {
  type HTMLElementVisibility,
  expectHeader2,
  clickButtonAndWaitForItToDisappear,
} from '../test_lib/testUtils'

export class OutroDialogFixture {
  public async close(): Promise<void> {
    console.log('OutroDialogFixture.close()')
    await clickButtonAndWaitForItToDisappear('I am sorry')
  }

  public assertVisibility(
    htmlElementVisibility?: HTMLElementVisibility,
    waitForElement = false,
  ): void {
    console.log('OutroDialogFixture.assertVisibility()')
    expectHeader2('Situation Report', htmlElementVisibility, waitForElement)
  }
}
