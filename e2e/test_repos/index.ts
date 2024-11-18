import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { $ } from 'execa'
import fse from 'fs-extra'
import { getTemplateDirPath, getTemplateTmpDirPath } from './utils'
import { Driver } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const resolveDriver = async (template: string): Promise<Driver> => {
  const driverPath = path.join(__dirname, 'templates', template, 'driver')
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
    console.error(
      `Failed to import or use driver for template: ${template}`,
      error
    )
    throw error // Fail the test if the driver fails to load
  }
}

export const getTemplates = () => {
  // Resolve the directory where this file is located
  const directory = path.resolve(__dirname)

  // Read all items in the directory
  const items = fs.readdirSync(directory)

  // Filter items to include only directories
  const folders = items.filter(item => {
    const itemPath = path.join(directory, item)
    return fs.statSync(itemPath).isDirectory()
  })

  return folders
}

export async function setupTemplates(templates: string[]): Promise<void> {
  // TODO: move into driver
  for (const templateDirPath of templates.map(template =>
    getTemplateDirPath(template)
  )) {
    const nodeModulesPath = path.join(templateDirPath, 'node_modules')
    if (!(await fse.exists(nodeModulesPath))) {
      await $({ cwd: templateDirPath })`npm install`
    }
  }
}

export async function cleanupTmpDirs(templates: string[]): Promise<void> {
  // TODO: move into driver
  for (const tmpDir of templates.map(template =>
    getTemplateTmpDirPath(template)
  )) {
    await fse.rm(tmpDir, { recursive: true, force: true })
  }
}
