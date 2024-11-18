import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { $ } from 'execa'
import fse from 'fs-extra'
import { getRepoDirPath, getRepoTmpDirPath } from './utils'
import { Driver } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const resolveDriver = async (repo: string): Promise<Driver> => {
  const driverPath = path.join(__dirname, 'repos', repo, 'driver')
  try {
    const driver = (await import(driverPath)) as unknown

    if (
      typeof driver !== 'object' ||
      !driver ||
      !('open' in driver) ||
      typeof driver.open !== 'function'
    ) {
      throw new Error(
        `Driver in ${driverPath} does not export a method named 'open'`
      )
    }

    return driver as Driver
  } catch (error) {
    console.error(`Failed to import or use driver for repo: ${repo}`, error)
    throw error // Fail the test if the driver fails to load
  }
}

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
