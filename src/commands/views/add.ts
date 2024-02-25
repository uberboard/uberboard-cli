import {Args, Command, ux} from '@oclif/core'
import * as path from 'node:path'

import Downloader from '../../service/downloader'

export default class Add extends Command {
  static args = {
    name: Args.string({description: 'Name of the view to download', required: true}),
  }

  static description = 'Install view'

  static flags = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
    const {name} = args

    ux.action.start(`Download and install available view '${name}'`)
    const downloader = new Downloader({
      targetDir: path.resolve(process.cwd(), 'views', name),
    })

    await downloader.download('uberboard', 'uberboard-widgets', `views/${name}`)
    ux.action.stop()
  }
}
