import {ux} from '@oclif/core'
import axios from 'axios'
import * as decompress from 'decompress'
import * as fs from 'node:fs'
import * as path from 'node:path'

export async function download(url: string, progressBar?: boolean): Promise<any> {
  let downloadBar: any
  if (progressBar) {
    downloadBar = ux.progress({
      format: 'Downloading [{bar}] {percentage}% | ETA: {eta}s',
    })
    downloadBar.start(100, 0, {
      speed: 'N/A',
    })
  }

  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      onDownloadProgress(progressEvent) {
        if (progressBar) {
          const {loaded, total} = progressEvent
          if (total) {
            const percent = Math.floor((loaded * 100) / total)
            downloadBar.update(percent)
          }
        }
      },
      responseType: 'arraybuffer',
      url,
    }).then(response => {
      progressBar && downloadBar.stop()
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export async function downloadAndExtractTar(url: string, dest: string): Promise<void> {
  const data = await download(url, false)
  await decompress(data, dest, {
    plugins: [
      //decompressTar(), decompressTarbz2(), decompressTargz(), decompressGz(), decompressUnzip(),
    ],
    strip: 1,
  })
}

export function ensureDashboardDirectory(baseDir: string = process.cwd()): void {
  if (!fs.existsSync(path.resolve(baseDir, '.uberboard'))) {
    throw (new Error('Current directory is NOT a uberboard dashboard!'))
  }
}
