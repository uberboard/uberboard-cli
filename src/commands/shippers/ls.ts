import {Command, ux} from "@oclif/core";
import Downloader from "../../service/downloader";


export default class Ls extends Command {

  static description = 'List remotely available shippers'

  static flags = {
  }

  static args = {

  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Ls)

    ux.log("Available shippers:")
    const downloader = new Downloader()

    const shipperList = await downloader.listSubfolders("uberboard", "uberboard-widgets", `shippers`)
    ux.log(shipperList.join("\n"))
  }
}
