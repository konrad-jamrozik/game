/* eslint-disable @typescript-eslint/class-methods-use-this */
import { clickButton } from '../testUtils'

export class AgentsDataGridFixture {
  public async hireAgent(): Promise<void> {
    await clickButton('Hire agent', 'Advance 1 turn')
  }
}
