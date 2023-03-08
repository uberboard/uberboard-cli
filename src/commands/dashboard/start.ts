import {Args, Command, Flags, ux} from '@oclif/core'

import {startDashboard} from "../../service/dashboardControl";

export default class Start extends Command {

  static description = 'Start dashboard in the current directory'

  static flags = {
  }

  static args = {

  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Start)
    ux.action.start('Starting dashboard')
    startDashboard()
    ux.action.stop()
  }

}
