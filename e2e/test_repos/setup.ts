import type { FullConfig } from '@playwright/test'
import { cleanupTmpDirs, setupTemplates } from '.'

export default async function setup(config: FullConfig): Promise<void> {
  const templates = config.projects
    .map(project => project.metadata.template as unknown)
    .filter(template => typeof template === 'string')
  await cleanupTmpDirs(templates)
  await setupTemplates(templates)
}
