import path from 'path'
import url from 'url'

export const ROOT_PATH = url.fileURLToPath(new URL('.', import.meta.url))
export const REPOS_DIR_PATH = path.join(ROOT_PATH, 'repos')

export interface RepoPaths {
  driverFilePath: string
  repoDirPath: string
  tmpDirPath: string
}

export function getRepoPaths(repo: string): RepoPaths {
  const repoRootDirPath = path.join(REPOS_DIR_PATH, repo)
  const repoDirPath = path.join(repoRootDirPath, 'repo')
  return {
    driverFilePath: path.join(repoRootDirPath, 'driver'),
    repoDirPath,
    tmpDirPath: path.join(repoDirPath, '.tmp')
  }
}
