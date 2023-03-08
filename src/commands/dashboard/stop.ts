import {Args, Command, Flags, ux} from '@oclif/core'
import {stopDashboard} from "../../service/dashboardControl";

export default class Stop extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {

  }

  static args = {
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Stop)
    ux.action.start('Stopping dashboard')
    stopDashboard()
    ux.action.stop()
  }
}
