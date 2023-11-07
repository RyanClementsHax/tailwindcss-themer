import { cleanupTmpDirs, setupTemplates } from './drivers'

export default async function setup(): Promise<void> {
  await cleanupTmpDirs()
  await setupTemplates()
}
