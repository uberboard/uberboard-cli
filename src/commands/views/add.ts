import {Args, Command, ux} from "@oclif/core";
import Downloader from "../../service/downloader";
import * as path from "path";

export default class Add extends Command {

  static description = 'Install view'

  static flags = {
  }

  static args = {
    name: Args.string({description: 'Name of the view to download', required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const {name} = args

    ux.action.start(`Download and install available view '${name}'`)
    const downloader = new Downloader({
      targetDir: path.resolve(process.cwd(), 'shippers', name)
    })

    await downloader.download("uberboard", "uberboard-widgets", `views/${name}`)
    ux.action.stop()
  }
}
