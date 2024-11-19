import type { FullConfig } from '@playwright/test'
import { cleanupTmpDirs, setupRepos } from '.'

export default async function setup(config: FullConfig): Promise<void> {
  const repos = config.projects
    .map(project => project.metadata.repo as unknown)
    .filter(repo => typeof repo === 'string')
  await cleanupTmpDirs(repos)
  await setupRepos(repos)
}
