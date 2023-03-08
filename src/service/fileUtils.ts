import axios from "axios"
import * as decompress from "decompress"
// @ts-ignore
import * as decompressUnzip from "decompress-unzip"
// @ts-ignore
import * as decompressTar from "decompress-tar"
// @ts-ignore
import * as decompressTargz from "decompress-targz"
// @ts-ignore
import * as decompressGz from "decompress-gz"
// @ts-ignore
import * as decompressTarbz2 from "decompress-tarbz2"
import {ux} from "@oclif/core";
import * as fs from "fs";
import * as path from "path";


export async function download(url: string, progressBar?: boolean): Promise<Buffer> {

  let downloadBar: any;
  if (progressBar) {
    downloadBar = ux.progress({
      format: 'Downloading [{bar}] {percentage}% | ETA: {eta}s'
    })
    downloadBar.start(100, 0, {
      speed: "N/A"
    })
  }

  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        if (progressBar) {
          const {loaded, total} = progressEvent
          if (!!total) {
            let percent = Math.floor((loaded * 100) / total);
            downloadBar.update(percent)
          }
        }
      }
    }).then((response) => {
      progressBar && downloadBar.stop()
      resolve(response.data)
    }).catch(e => {
      reject(e)
    })
  })
}

export async function downloadAndExtractTar(url: string, dest: string) {
  const data = await download(url, false)
  await decompress(data, dest, {
    strip: 1,
      plugins: [
      decompressTar(), decompressTarbz2(), decompressTargz(), decompressGz(), decompressUnzip()
    ]
  })
}

export function ensureDashboardDirectory(baseDir: string = process.cwd()) {
  if (!fs.existsSync(path.resolve(baseDir, '.uberboard'))) {
    console.error("Current directory is NOT a uberboard dashboard! Exiting...")
    process.exit(42)
  }
}
