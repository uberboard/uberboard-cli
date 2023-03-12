import {Args, Command, ux} from "@oclif/core";
import Downloader from "../../service/downloader";
import * as path from "path";

export default class Add extends Command {

  static description = 'Download and install shipper'

  static flags = {
  }

  static args = {
    name: Args.string({description: 'Name of the shipper to download', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const {name} = args

    ux.action.start(`Download and install available shipper '${name}'`)
    const downloader = new Downloader({
      targetDir: path.resolve(process.cwd(), 'shippers', name)
    })

    await downloader.download("uberboard", "uberboard-widgets", `shippers/${name}`)
    ux.action.stop()
  }
}
