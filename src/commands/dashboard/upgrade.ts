import {Args, Command, ux} from '@oclif/core'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {dirname} from 'node:path'
import {gunzip} from 'node:zlib'

import {download, ensureDashboardDirectory} from '../../service/file-utils'

export default class Upgrade extends Command {
  static args = {
    dashboardDir: Args.string({description: 'Name of the dashboard folder to upgrade', required: false}),
  }

  static description = 'Upgrade dashboard version'

  static flags = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Upgrade)
    const latestVersion = 'stable'
    const dashboardDir = args.dashboardDir || process.cwd()

    ensureDashboardDirectory(dashboardDir)
    let platform = this.detectPlatform();

    let binaryFileName = platform == 'win' ? 'dashboard.exe' : 'dashboard'
    const binaryDir = path.join(dashboardDir, `.uberboard/bin/${latestVersion}`)
    let binaryFileDest = path.join(binaryDir, binaryFileName)

    const skipDownload = fs.existsSync(binaryFileDest)
    if (skipDownload) {
      console.info(`Dashboard is already up-to-date (${latestVersion}). Nothing to do here.`)
    }

    if (!skipDownload) {
      fs.mkdirSync(binaryDir, {recursive: true})

      // download dashboard binary:

      let arch = os.arch()
      if (['arm', 'arm64'].includes(arch)) {
        console.warn('Using x64 arch as fallback for unsupported ARM architecture')
        arch = 'x64'
      }

      if (platform === 'win') {
        arch = `${arch}.exe`
      }

      const dashboardBinaryDownloadUrl = `https://releases-uberboard.s3.eu-central-1.amazonaws.com/${latestVersion}/dashboard-${platform}-${arch}.gz`
      console.info('Loading binary from', dashboardBinaryDownloadUrl)
      const binaryData = await download(dashboardBinaryDownloadUrl, true)

      ux.action.start('Unzipping dashboard binary')
      gunzip(binaryData, (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        fs.writeFileSync(binaryFileDest, data)
        fs.chmodSync(binaryFileDest, '755')

        const linkFileName = platform == 'win' ? 'dashboard.lnk' : 'dashboard'
        const symlinkFileLocation = path.join(dashboardDir, '.uberboard', 'bin', linkFileName)
        if (!fs.existsSync(symlinkFileLocation)) {
          if (platform === 'win') {
            const ws = require('windows-shortcuts')
            ws.create(symlinkFileLocation, binaryFileDest);
          } else {
            fs.symlinkSync(path.relative(dirname(symlinkFileLocation), binaryFileDest), symlinkFileLocation, 'file')
          }
        }

        ux.action.stop()
      })
    }
  }

  private detectPlatform() {
    let platform: string = os.platform()
    if (platform === 'darwin') {
      platform = 'macos'
    }

    if (platform === 'win32') {
      platform = 'win'
    }
    return platform;
  }
}
