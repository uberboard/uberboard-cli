import {ux} from '@oclif/core'
import {spawn, spawnSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from "node:os";

const pidFilePath = path.join(process.cwd(), '.uberboard/.pid')

export const startDashboardDaemon = () => {
  const binaryName = detectPlatform() == 'win' ? 'dashboard.cmd' : 'dashboard'
  const out = fs.openSync(path.join(process.cwd(), '.uberboard/info.log'), 'a')
  const err = fs.openSync(path.join(process.cwd(), '.uberboard/error.log'), 'a')

  const dashboardProcess = spawn(path.join(process.cwd(), `.uberboard/bin/${binaryName}`), [], {
    cwd: process.cwd(),
    detached: true,
    stdio: ['ignore', out, err],
  })
  if (dashboardProcess.pid) {
    fs.writeFileSync(pidFilePath, String(dashboardProcess.pid))
    dashboardProcess.unref()
  }
}

export const startDashboardSync = () => {
  const binaryName = detectPlatform() == 'win' ? 'dashboard.cmd' : 'dashboard'
  spawnSync(path.join(process.cwd(), `.uberboard/bin/${binaryName}`), [], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
}

export const stopDashboard = () => {
  if (!fs.existsSync(pidFilePath)) {
    console.error("Dashboard's not running!")
    return
  }

  const dashboardPIDString = fs.readFileSync(pidFilePath).toString('utf8')
  const dashboardPID = Number.parseInt(dashboardPIDString, 10)
  ux.action.start('Stopping dashboard')
  if (Number.isNaN(dashboardPID)) {
    console.error('Failed to read process PID:', dashboardPID)
  } else {
    spawnSync('kill', ['-9', `${dashboardPID}`], {
      stdio: ['ignore', 'inherit', 'inherit'],
    })
  }

  fs.unlinkSync(pidFilePath)
  ux.action.stop()
}

export const detectPlatform = () => {
  let platform: string = os.platform()
  if (platform === 'darwin') {
    platform = 'macos'
  }

  if (platform === 'win32') {
    platform = 'win'
  }
  return platform;
}
