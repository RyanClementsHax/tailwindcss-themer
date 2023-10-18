import fse from 'fs-extra'
import url from 'node:url'
import path from 'node:path'
import { $ } from 'execa'

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

async function setup(): Promise<void> {
  // 1. remove .tmp dir
  const template = 'create-react-app'
  const integrationTemplateDir = path.resolve(
    __dirname,
    TEMPLATES_DIR,
    template
  )
  const tmpDirPath = path.join(integrationTemplateDir, TMP_DIR)
  await fse.rm(tmpDirPath, { recursive: true, force: true })

  // 2. run npm install if node_modules isn't present
  const nodeModulesPath = path.join(integrationTemplateDir, 'node_modules')
  if (!(await fse.exists(nodeModulesPath))) {
    await $({ cwd: integrationTemplateDir })`npm install`
  }
}

export default setup
