import {Octokit} from '@octokit/rest'
import * as handlebars from 'handlebars'
import * as JSZip from 'jszip'
import * as fs from 'node:fs'

type DownloaderOptions = {
  github?: {
    auth: string
  }
  targetDir?: string
}

export default class Downloader {
  public options: DownloaderOptions
  // private cache: Keyv<string, object>
  private defaultOptions = {
    targetDir: process.cwd(),
  }

  private octokit: any

  constructor(options: DownloaderOptions = {}) {
    // this.cache = new Keyv({namespace: 'uberboard-cli', ttl: 1000 * 60 * 10})
    this.options = {...this.defaultOptions, ...options}
    this.octokit = new Octokit(this.options.github)
    handlebars.registerHelper('keepAsVariable', function(text) {
      const result = '{{' + text + ']}';
      return new Handlebars.SafeString(result);
    });
  }

  async download(owner: string, repository: string, folder: string, templateReplacementData = {}) {
    const outputDirectory = this.options?.targetDir || process.cwd()
    await this.downloadGithubFolder(owner, repository, folder, outputDirectory, templateReplacementData)
  }

  async downloadGithubFolder(owner: string, repo: string, path: string, destination: string, templateReplacementData = {}) {
    // Get the repo as a zip archive
    const response = await this.octokit.repos.downloadZipballArchive({
      archive_format: 'zipball',
      owner,
      ref: 'main',
      repo,
    })

    const zip = await JSZip.loadAsync(response.data)
    const folderRegex = new RegExp(`[^/]+/${path}/`) // To match files within the specific subfolder

    return Promise.all(
      Object.keys(zip.files)
      .filter(filename => folderRegex.test(filename))
      .map(async filename => {
        const file = zip.files[filename]
        if (!file.dir) {
          const content = await file.async('nodebuffer')
          const relativePath = filename.replace(/[^/]+\//, '') // Remove the first folder (usually the repo name)
          const outputPath = `${relativePath}`
          const hbsTemplateFilename = handlebars.compile(outputPath)
          const realTargetPath = hbsTemplateFilename(templateReplacementData).replace(path, destination + "/")
          await fs.promises.mkdir(realTargetPath.replace(/\/[^/]+$/, ''), {recursive: true})

          const contentTemplate = handlebars.compile(Buffer.from(content).toString())
          await fs.promises.writeFile(realTargetPath, contentTemplate(templateReplacementData))
        }
      }),
    )
  }

  async listSubfolders(owner: string, repo: string, path: string): Promise<string[]> {
    try {
      const {data} = await this.octokit.repos.getContent({
        owner,
        path,
        repo,
      })

      // Filtere nur Verzeichnisse heraus und gebe ihre Namen zurück
      return data
      .filter((item: any) => item.type === 'dir')
      .map((dir: any) => dir.name)
    } catch (error: any) {
      let retryDate = null
      if (error.response.status === 403) {
        const date = Number.parseInt(error.response.headers['x-ratelimit-reset'], 10)
        if (Number.isInteger(date)) {
          retryDate = new Date(date * 1000)
        }
      }

      console.error('API rate limit reached. Please try again after', retryDate)
      if (!retryDate) {
        console.error('An error occurred during listing subfolders', error)
      }

      return []
    }
  }
}
