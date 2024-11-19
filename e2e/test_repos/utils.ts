import url from 'node:url'
import path from 'node:path'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'

const REPOS_DIR = 'repos'
const reposDirPath = url.fileURLToPath(new URL('.', import.meta.url))

export function getRepoRootPath(repo: string) {
  return path.resolve(reposDirPath, REPOS_DIR, repo)
}

export function getRepoDirPath(repo: string) {
  return path.join(getRepoRootPath(repo), 'repo')
}

export function getRepoTmpDirPath(repo: string) {
  const repoDirPath = getRepoDirPath(repo)
  // TODO: remove
  return path.join(repoDirPath, '.tmp')
}

export function parseClasses(config: MultiThemePluginOptions): string[] {
  const themeNameClasses = [
    'defaultTheme',
    ...(config.themes?.map(x => x.name) ?? [])
  ]
  const preloadedVariantStyles = themeNameClasses.flatMap(themeName =>
    stylesToKeep.map(style => `${themeName}:${style}`)
  )
  const mediaQueries =
    config.themes?.map(x => x.mediaQuery ?? '')?.filter(x => !!x) ?? []
  const selectors = config.themes?.flatMap(x => x.selectors ?? []) ?? []
  return [
    ...themeNameClasses,
    ...preloadedVariantStyles,
    ...mediaQueries,
    ...selectors,
    ...stylesToKeep
  ]
}

// Preventing purging of these styles makes writing tests with arbitrary classes
// easier since otherwise they'd have to define the styles they use when opening
// the repo instance
const stylesToKeep = [
  'bg-primary',
  'bg-primary/75',
  'bg-primary-DEFAULT-500',
  'font-title',
  'text-textColor',
  'text-textColor/50'
]
