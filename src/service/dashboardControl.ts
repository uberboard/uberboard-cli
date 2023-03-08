import {exec, execSync, spawn, spawnSync} from "child_process";
import * as path from "path";
import * as fs from "fs";
import {ux} from "@oclif/core";
import {isNumber} from "util";


const pidFilePath = path.join(process.cwd(), `.uberboard/.pid`)

export const startDashboard = () => {
  const out = fs.openSync(path.join(process.cwd(), '.uberboard/info.log'), 'a');
  const err = fs.openSync(path.join(process.cwd(), '.uberboard/error.log'), 'a');
  const dashboardProcess = spawn(path.join(process.cwd(), `.uberboard/bin/dashboard`), [], {
    cwd: process.cwd(),
    detached: true,
    stdio: [ 'ignore', out, err ]
  })
  if (!!dashboardProcess.pid) {
    fs.writeFileSync(pidFilePath, "" + dashboardProcess.pid)
    dashboardProcess.unref()
  }
}

export const stopDashboard = () => {
  if (!fs.existsSync(pidFilePath)) {
    console.error("Dashboard's not running!")
    return
  }
  const dashboardPIDString = fs.readFileSync(pidFilePath).toString("utf-8")
  const dashboardPID = Number.parseInt(dashboardPIDString)
  ux.action.start("Stopping dashboard")
  if (isNaN(dashboardPID)) {
    console.error("Failed to read process PID:", dashboardPID)
  } else {
    spawnSync("kill", ["-9", `${dashboardPID}`], {
      stdio: ["ignore", "inherit", "inherit"]
    })
  }
  fs.unlinkSync(pidFilePath)
  ux.action.stop()
}
