import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { $ } from 'execa'
import fse from 'fs-extra'
import { getRepoDirPath, getRepoTmpDirPath } from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getRepos = () => {
  const directory = path.resolve(__dirname)
  const items = fs.readdirSync(directory)
  return items.filter(item =>
    fs.statSync(path.join(directory, item)).isDirectory()
  )
}

export async function setupRepos(repos: string[]): Promise<void> {
  // TODO: move into driver
  for (const repoDirPath of repos.map(repo => getRepoDirPath(repo))) {
    const nodeModulesPath = path.join(repoDirPath, 'node_modules')
    if (!(await fse.exists(nodeModulesPath))) {
      await $({ cwd: repoDirPath })`npm install`
    }
  }
}

export async function cleanupTmpDirs(repos: string[]): Promise<void> {
  // TODO: move into driver
  for (const tmpDir of repos.map(repo => getRepoTmpDirPath(repo))) {
    await fse.rm(tmpDir, { recursive: true, force: true })
  }
}
