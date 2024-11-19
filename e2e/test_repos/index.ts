import fs from 'fs'
import path from 'path'
import { resolveDriver } from './drivers'
import { REPOS_DIR_PATH } from './paths'

export const getRepos = () => {
  const directory = REPOS_DIR_PATH
  const items = fs.readdirSync(directory)
  return items.filter(item =>
    fs.statSync(path.join(directory, item)).isDirectory()
  )
}

export async function setupRepos(repos: string[]): Promise<void> {
  for (const repo of repos) {
    const driver = await resolveDriver(repo)
    await driver.install()
  }
}

export async function cleanupTmpDirs(repos: string[]): Promise<void> {
  for (const repo of repos) {
    const driver = await resolveDriver(repo)
    await driver.cleanup()
  }
}
