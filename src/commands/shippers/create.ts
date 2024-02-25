import {Args, Command} from '@oclif/core'
import * as path from 'node:path'

import Downloader from '../../service/downloader'
import {ensureDashboardDirectory} from '../../service/file-utils'

export default class Create extends Command {
  static args = {
    name: Args.string({description: 'Name of the shipper to create', required: true}),
  }

  static description = 'Create base files to create your own shipper'

  static flags = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)
    const {name} = args

    ensureDashboardDirectory()

    const downloader = new Downloader({
      targetDir: path.resolve(process.cwd(), 'shippers'),
    })
    await downloader.download('uberboard', 'uberboard-cli', 'templates/shipper', {name})
  }
}
