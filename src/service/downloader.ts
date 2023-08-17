import {Octokit} from "@octokit/rest";
import * as Keyv from "keyv";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as JSZip from "jszip";

type DownloaderOptions = {
  github?: {
    auth: string
  }
  targetDir?: string
}

export default class Downloader {
  private octokit: any;
  private cache: Keyv<any, any>;
  public options: DownloaderOptions;

  private defaultOptions = {
    targetDir: process.cwd()
  }

  constructor(options: DownloaderOptions = {}) {
    this.cache = new Keyv({ttl: 1000 * 60 * 10, namespace: 'uberboard-cli'});
    this.options = Object.assign({}, this.defaultOptions, options)
    this.octokit = new Octokit(this.options.github)
  }

  async downloadGithubFolder(owner: string, repo: string, path: string, destination: string, templateReplacementData = {}) {
    // Get the repo as a zip archive
    const response = await this.octokit.repos.downloadArchive({
      owner,
      repo,
      archive_format: 'zipball',
      ref: 'main'
    });

    const zip = await JSZip.loadAsync(response.data);
    const folderRegex = new RegExp(`[^/]+/${path}/`); // To match files within the specific subfolder

    await Promise.all(
      Object.keys(zip.files)
        .filter(filename => folderRegex.test(filename))
        .map(async filename => {
          const file = zip.files[filename];
          if (!file.dir) {
            const content = await file.async('nodebuffer');
            const relativePath = filename.replace(/[^/]+\//, ''); // Remove the first folder (usually the repo name)
            const outputPath = `${relativePath}`;
            const hbsTemplateFilename = handlebars.compile(outputPath)
            const realTargetPath = hbsTemplateFilename(templateReplacementData)
            await fs.promises.mkdir(realTargetPath.replace(/\/[^/]+$/, ''), {recursive: true});

            const contentTemplate = handlebars.compile(Buffer.from(content).toString())
            await fs.promises.writeFile(realTargetPath, contentTemplate(templateReplacementData));
          }
        })
    );
  }

  async download(owner: string, repository: string, folder: string, templateReplacementData = {}) {
    const outputDirectory = this.options?.targetDir || process.cwd()
    await this.downloadGithubFolder(owner, repository, folder, outputDirectory, templateReplacementData)
  }

  async listSubfolders(owner: string, repo: string, path: string) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      // Filtere nur Verzeichnisse heraus und gebe ihre Namen zurück
      return data
        .filter((item: any) => item.type === 'dir')
        .map((dir: any) => dir.name);
    } catch (error: any) {

      let retryDate = null;
      if (error.response.status == 403) {
        const date = Number.parseInt(error.response.headers['x-ratelimit-reset'])
        if (Number.isInteger(date)) {
          retryDate = new Date(date * 1000)
        }
      }
      console.error("API rate limit reached. Please try again after ", retryDate)
      if (!retryDate) {
        console.error("An error occurred during listing subfolders", error);
      }
      return [];
    }
  }

}
