import {Command} from "@oclif/core";

export default class Index extends Command {

  static description = 'Manage uberboard shippers'

  static flags = {
  }

  static args = {

  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Index)
  }
}
