import {Args, Command, ux} from '@oclif/core'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {dirname} from 'node:path'
import {gunzip} from 'node:zlib'

import {download, ensureDashboardDirectory} from '../../service/file-utils'
import {detectPlatform} from "../../service/dashboard-control";

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
    let platform = detectPlatform();

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
      if (['arm', 'arm64', 'ia32'].includes(arch)) {
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

        this.createSymlink(platform, dashboardDir, binaryFileDest);

        ux.action.stop()
      })
    }
  }

  private createSymlink(platform: string, dashboardDir: string, binaryFileDest: string) {
    const filename = 'dashboard'
    const binFolder = path.join(dashboardDir, '.uberboard', 'bin')
    if (platform != 'win') {
      const symlinkFileLocation = path.join(binFolder, filename)
      if (!fs.existsSync(symlinkFileLocation)) {
        fs.symlinkSync(path.relative(dirname(symlinkFileLocation), binaryFileDest), symlinkFileLocation, 'file')
      }
      return
    }

    // create cmd file for windows:
    const cmdFileLocation = path.join(binFolder, filename + ".cmd")
    if (!fs.existsSync(cmdFileLocation)) {
      try {
        fs.writeFileSync(cmdFileLocation, `
@echo off
"${binFolder}/stable/dashboard.exe" %*
        `);
        // file written successfully
      } catch (err) {
        console.error(err);
      }
    }
  }

}
