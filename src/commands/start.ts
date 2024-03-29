import {Command, Flags, ux} from '@oclif/core'

import {startDashboardDaemon, startDashboardSync} from '../service/dashboard-control'

export default class Start extends Command {
  static args = {}

  static description = 'Start dashboard in the current directory'

  static flags = {
    daemon: Flags.boolean({char: 'd', description: 'If provided, the dashboard will be running in background', name: 'daemon'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Start)
    const {daemon} = flags
    if (daemon) {
      ux.action.start('Starting dashboard')
      startDashboardDaemon()
      ux.action.stop()
      console.info('Open in browser: http://localhost:3000')
    } else {
      startDashboardSync()
    }
  }
}
