import { Args, Command, Flags, ux } from '@oclif/core'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { dirname } from 'node:path'
import { gunzip } from 'node:zlib'
import { promisify } from 'node:util'

import { download, ensureDashboardDirectory } from '../../service/file-utils'
import { detectPlatform } from "../../service/dashboard-control"

const gunzipAsync = promisify(gunzip)

export default class Upgrade extends Command {
  static args = {
    dashboardDir: Args.string({ description: 'Name of the dashboard folder to upgrade', required: false }),
  }

  static flags = {
    channel: Flags.string({ description: 'Release channel (e.g., stable, beta)', default: 'stable' }),
  }

  static description = 'Upgrade dashboard version'

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Upgrade)
    const channel = flags.channel || 'stable'
    const dashboardDir = args.dashboardDir || process.cwd()

    ensureDashboardDirectory(dashboardDir)
    const platform = detectPlatform()

    const binaryFileName = platform === 'win' ? 'dashboard.exe' : 'dashboard'
    const binaryDir = path.join(dashboardDir, `.uberboard/bin/${channel}`)
    const binaryFileDest = path.join(binaryDir, binaryFileName)

    let arch = os.arch()
    if (['arm', 'arm64', 'ia32'].includes(arch)) {
      console.warn('Using x64 arch as fallback for unsupported ARM architecture')
      arch = 'x64'
    }

    if (platform === 'win') {
      arch = `${arch}.exe`
    }

    const dashboardBinaryDownloadUrl = `https://releases-uberboard.s3.eu-central-1.amazonaws.com/${channel}/dashboard-${platform}-${arch}.gz`

    ux.action.start(`Downloading and installing dashboard from ${dashboardBinaryDownloadUrl}`)

    try {
      fs.mkdirSync(binaryDir, { recursive: true })

      // Backup der bestehenden Binary (falls vorhanden)
      if (fs.existsSync(binaryFileDest)) {
        const backupFile = binaryFileDest + '.backup'
        fs.copyFileSync(binaryFileDest, backupFile)
        this.log(`Existing dashboard binary backed up to ${backupFile}`)
      }

      const binaryData = await download(dashboardBinaryDownloadUrl, true)

      const unzippedData = await gunzipAsync(binaryData)

      fs.writeFileSync(binaryFileDest, unzippedData)
      fs.chmodSync(binaryFileDest, '755')

      this.createSymlink(platform, dashboardDir, binaryFileDest, channel)

      ux.action.stop('done')
      this.log(`Dashboard upgraded successfully to '${channel}' channel.`)

    } catch (error) {
      ux.action.stop('failed')
      this.error(`Failed to upgrade dashboard: ${(error as Error).message}`, { exit: 1 })
    }
  }

  private createSymlink(platform: string, dashboardDir: string, binaryFileDest: string, channel: string) {
    const filename = 'dashboard'
    const binFolder = path.join(dashboardDir, '.uberboard', 'bin')

    if (platform !== 'win') {
      const symlinkFileLocation = path.join(binFolder, filename)
      if (!fs.existsSync(symlinkFileLocation)) {
        fs.symlinkSync(path.relative(dirname(symlinkFileLocation), binaryFileDest), symlinkFileLocation, 'file')
      }
      return
    }

    // Windows: .cmd-File als Wrapper erzeugen
    const cmdFileLocation = path.join(binFolder, filename + ".cmd")
    if (!fs.existsSync(cmdFileLocation)) {
      try {
        fs.writeFileSync(cmdFileLocation, `
@echo off
"${binFolder}/${channel}/dashboard.exe" %*
        `.trimStart());
      } catch (err) {
        console.error('Failed to create CMD wrapper:', err)
      }
    }
  }
}
