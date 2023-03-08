import {Command} from "@oclif/core";

export default class Add extends Command {

  static description = 'Install shipper'

  static flags = {
  }

  static args = {

  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    console.log("Install available shipper by name")
  }
}
