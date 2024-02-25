import {Command, ux} from '@oclif/core'

import Downloader from '../../service/downloader'

export default class Ls extends Command {
  static args = {}

  static description = 'List remotely available views'

  static flags = {}

  async run(): Promise<void> {
    // const {args, flags} = await this.parse(Ls)

    ux.log('Available views:')
    const downloader = new Downloader()
    const viewList = await downloader.listSubfolders('uberboard', 'uberboard-widgets', 'views')
    ux.log(viewList.join('\n'))
  }
}
