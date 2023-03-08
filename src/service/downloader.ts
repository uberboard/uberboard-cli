import {Octokit} from "@octokit/rest";
import * as Keyv from "keyv";
import * as path from "path";
import * as fs from "fs";
import {writeFileSync} from "fs";
import * as handlebars from "handlebars";

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

  #createDirectories(filepath: string) {
    const dir = path.dirname(filepath);
    fs.mkdirSync(dir, {recursive: true})
  }

  async #traverseRecursively(owner: string, repo: string, folder: string, sha?: string) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      ref: sha,
      path: folder,
    });

    const dirs = data.map((node: any) => {
      if (node.type === 'dir') {
        return this.#traverseRecursively(owner, repo, node.path, sha);
      }
      return {
        path: node.path,
        type: node.type,
        sha: node.sha
      };
    });
    return Promise.all(dirs).then((nodes) => nodes.flat());
  }

  async #getDirectoryTree(owner: string, repo: string, directory: string, sha?: string) {
    const cacheKey = sha ? `${owner}/${repo}#${sha}` : `${owner}/${repo}`;

    const cachedTree = await this.cache.get(cacheKey);
    if (cachedTree) {
      return cachedTree;
    }

    const tree = await this.#traverseRecursively(owner, repo, directory, sha);

    await this.cache.set(cacheKey, tree);

    return tree;
  }

  async #fetchFiles(owner: string, repo: string, directory: string) {
    const tree = await this.#getDirectoryTree(owner, repo, directory);

    const files = tree
      .filter((node: any) => node.path.startsWith(directory) && node.type === 'file')
      .map(async (node: any) => {
        const { data } = await this.octokit.git.getBlob({
          owner,
          repo,
          file_sha: node.sha,
        });
        return {
          path: node.path,
          contents: Buffer.from(data.content, data.encoding),
        };
      });

    return Promise.all(files);
  }

  async download(owner: string, repository: string, folder: string, templateReplacementData = {}) {
    const outputDirectory = this.options?.targetDir || process.cwd()

    const files = await this.#fetchFiles(owner, repository, folder)
    files
      .map(file => {
        const relativeFilePath = path.relative(folder, file.path)
        const targetFile = path.resolve(outputDirectory, relativeFilePath)


        const hbsTemplateFilename = handlebars.compile(targetFile)
        const realTargetFile = hbsTemplateFilename(templateReplacementData)
        this.#createDirectories(realTargetFile)

        const contentTemplate = handlebars.compile(Buffer.from(file.contents).toString())
        writeFileSync(realTargetFile, contentTemplate(templateReplacementData))
      })
  }
}
