import { cleanupTmpDirs, setupTemplates } from './repos'

async function setup(): Promise<void> {
  await cleanupTmpDirs()
  await setupTemplates()
}

export default setup
