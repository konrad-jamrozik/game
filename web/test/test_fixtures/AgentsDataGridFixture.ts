/* eslint-disable @typescript-eslint/class-methods-use-this */
import { clickButton } from '../test_lib/testUtils'

export class AgentsDataGridFixture {
  public async hireAgent(): Promise<void> {
    await clickButton('Hire agent', 'Advance 1 turn')
  }
}
