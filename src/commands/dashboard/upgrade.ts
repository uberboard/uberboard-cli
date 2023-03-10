import {Args, Command, ux} from "@oclif/core";
import * as fs from "fs-extra";
import * as path from "path";

import {download, ensureDashboardDirectory} from "../../service/fileUtils";
import {gunzip} from "zlib";
import * as os from "os";
import {dirname} from "path";

export default class Upgrade extends Command {

  static description = 'Upgrade dashboard version'

  static flags = {
  }

  static args = {
    dashboardDir: Args.string({description: 'Name of the dashboard folder to upgrade', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Upgrade)
    const latestVersion = "v1.2.0-5cc9e15"
    const dashboardDir = !!args.dashboardDir ? args.dashboardDir : process.cwd()

    ensureDashboardDirectory(dashboardDir)

    const binaryDir = path.join(dashboardDir, `.uberboard/bin/${latestVersion}`)
    const binaryFileDest = path.join(binaryDir, 'dashboard')

    const skipDownload = fs.existsSync(binaryFileDest)
    if (skipDownload) {
      console.info(`Dashboard is already up-to-date (${latestVersion}). Nothing to do here.`)
    }
    if (!skipDownload) {
      fs.mkdirSync(binaryDir, {recursive: true})

      // download dashboard binary:
      let platform: string = os.platform()
      if (platform === 'darwin') {
        platform = 'macos'
      }
      const arch = os.arch()
      const dashboardBinaryDownloadUrl = `https://s3.eu-central-1.amazonaws.com/releases.uberboard.io/${latestVersion}/dashboard-${platform}-x64.gz`
      const binaryData = await download(dashboardBinaryDownloadUrl, true)

      ux.action.start(`Unzipping dashboard binary`)
      gunzip(binaryData, (err, data) => {
        if (!!err) {
          console.error(err)
          return
        }
        fs.writeFileSync(binaryFileDest, data)
        fs.chmodSync(binaryFileDest, "755")
        const symlinkFile = path.join(dashboardDir, '.uberboard', 'bin', 'dashboard')
        if (!fs.existsSync(symlinkFile)) {
          fs.symlinkSync(path.relative(dirname(symlinkFile), binaryFileDest), symlinkFile, 'file')
        }
        ux.action.stop()
      })
    }
  }

}
