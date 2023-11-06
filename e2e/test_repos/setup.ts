import { cleanupTmpDirs, setupTemplates } from './drivers'

async function setup(): Promise<void> {
  await cleanupTmpDirs()
  await setupTemplates()
}

export default setup
