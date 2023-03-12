import {Args, Command} from "@oclif/core";
import Downloader from "../../service/downloader";
import {ensureDashboardDirectory} from "../../service/fileUtils";
import * as path from "path";

export default class Create extends Command {

  static description = 'Create base files to create your own shipper'

  static flags = {
  }

  static args = {
    name: Args.string({description: 'Name of the shipper to create', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)
    const {name} = args

    ensureDashboardDirectory()

    const downloader = new Downloader({
      targetDir: path.resolve(process.cwd(), 'shippers')
    })
    await downloader.download("uberboard", "uberboard-cli", "templates/shipper", {name})
  }
}
