import {Command} from "@oclif/core";

export default class Ls extends Command {

  static description = 'List remotely available shippers'

  static flags = {
  }

  static args = {

  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Ls)
    console.log("Listing available shippers")
  }
}
