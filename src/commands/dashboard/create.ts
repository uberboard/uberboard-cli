import {Args, Command, ux} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

import Downloader from '../../service/downloader'

export default class Create extends Command {
  static args = {
    name: Args.string({description: 'Name of the dashboard folder to create', required: false}),
  }

  static description = 'Create a new dashboard'

  static flags = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)
    let {name} = args
    if (!name) {
      name = await ux.prompt("Dashboard's directory name")
    }

    const dashboardDir = path.join('.', name)
    if (fs.existsSync(dashboardDir)) {
      this.log(`WARNING: directory '${dashboardDir}' already exists!`)
      const shouldProceed = await ux.confirm('Proceed (y/n)')
      if (!shouldProceed) {
        console.info('ok, bye!')
        process.exit()
      }
    }

    // download bootstrap files:
    ux.action.start(`Installing dashboard files at ${dashboardDir}`)
    fs.mkdirSync(path.join(dashboardDir, '.uberboard'), {recursive: true})

    const downloader = new Downloader()
    await downloader.download('uberboard', 'uberboard-cli', 'templates/dashboard', {name})

    fs.mkdirSync(path.join(dashboardDir, 'views'), {recursive: true})
    fs.mkdirSync(path.join(dashboardDir, 'shippers'), {recursive: true})

    ux.action.stop()

    await this.config.runCommand('dashboard:upgrade', [dashboardDir])
  }
}
