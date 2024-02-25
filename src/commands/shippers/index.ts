import {Command} from '@oclif/core'

export default class Index extends Command {
  static args = {}

  static description = 'Manage uberboard shippers'

  static flags = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Index)
  }
}
