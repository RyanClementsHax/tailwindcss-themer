import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveDriver } from './drivers'

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
