import url from 'node:url'
import path from 'node:path'
import fse from 'fs-extra'
import { spawn } from 'cross-spawn'
import { $, execa } from 'execa'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

export type Template = 'create-react-app'

export interface IsolatedRepoInstance {
  writeFile(fileName: string, data: string): Promise<{ filePath: string }>
  getBuildDir(): string
  build(options: BuildOptions): Promise<void>
  startServer(options: StartServerOptions): Promise<{ stop: () => void }>
}

export interface BuildOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
}

export interface StartServerOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
  isServerStarted: (context: { stdout: string; template: Template }) => boolean
}

export interface IsolatedRepoInstanceOptions {
  tmpDirName: string
  template: Template
}

const tmpDirNameRegex = /^[a-zA-Z0-9_,\-.]+$/

export async function createIsolatedRepoInstance(
  options: IsolatedRepoInstanceOptions
): Promise<{ isAlreadyInitialized: boolean; instance: IsolatedRepoInstance }> {
  if (!options.tmpDirName.match(tmpDirNameRegex)) {
    throw new Error(
      `Could not run open instance of repo with tmp dir name ${options.tmpDirName} because it uses characters not safe for creating a directory name for temporary files. Please use file name safe characters (regex: ${tmpDirNameRegex})`
    )
  }
  const templateDirPath = getTemplateDirPath(options.template)
  const tmpDirPath = getTmpDirPath(options.template, options.tmpDirName)
  let isAlreadyInitialized = false
  if (await fse.exists(tmpDirPath)) {
    isAlreadyInitialized = true
  } else {
    await fse.ensureDir(tmpDirPath)
  }
  return {
    isAlreadyInitialized,
    instance: new IsolatedRepoInstanceImpl({
      template: options.template,
      tmpDirPath,
      templateDirPath
    })
  }
}

export async function setupTemplates(): Promise<void> {
  const templateDirPaths = getTemplateDirPaths()
  for (const templateDirPath of templateDirPaths) {
    const nodeModulesPath = path.join(templateDirPath, 'node_modules')
    if (!(await fse.exists(nodeModulesPath))) {
      await $({ cwd: templateDirPath })`npm install`
    }
  }
}

export async function cleanupTmpDirs(): Promise<void> {
  for (const tmpDir of getTemplateTmpDirPaths()) {
    await fse.rm(tmpDir, { recursive: true, force: true })
  }
}

interface IsolatedRepoInstanceConfig {
  template: Template
  tmpDirPath: string
  templateDirPath: string
}

class IsolatedRepoInstanceImpl implements IsolatedRepoInstance {
  constructor(private config: IsolatedRepoInstanceConfig) {}

  async writeFile(fileName: string, data: string) {
    const filePath = path.join(this.config.tmpDirPath, fileName)
    await fse.writeFile(filePath, data)
    return { filePath }
  }

  getBuildDir(): string {
    return path.join(this.config.tmpDirPath, 'build')
  }

  async build({ command, env }: BuildOptions) {
    await execa(command[0], command[1], {
      cwd: this.config.templateDirPath,
      env
    })
  }

  async startServer(options: StartServerOptions) {
    return await new Promise<{ stop: () => void }>((resolve, reject) => {
      const serveProcess = spawn(options.command[0], options.command[1], {
        env: {
          // make sure npm executable can be found on path
          PATH: process.env['PATH'],
          ...options.env
        },
        cwd: this.config.templateDirPath
      })
      const stop = () => serveProcess.kill()
      const fullCommand = `${options.command[0]} ${options.command[1].join(
        ' '
      )}`
      let started = false
      let stdout = ''
      const rejectTimeout = setTimeout(() => {
        reject(
          new Error(
            `Timed out waiting for server to start with ${fullCommand}\n\n${stdout}`
          )
        )
      }, 20_000)
      serveProcess.stderr.pipe(process.stderr)
      serveProcess.stdout.on('data', chunk => {
        if (started) return
        const newChunk = chunk.toString()
        stdout += newChunk
        try {
          started = options.isServerStarted({
            stdout,
            template: this.config.template
          })
          if (started) {
            clearTimeout(rejectTimeout)
            started = true
            resolve({
              stop
            })
          }
        } catch (e: unknown) {
          clearTimeout(rejectTimeout)
          started = true
          stop()
          reject(e)
        }
      })
    })
  }
}

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const reposDirPath = url.fileURLToPath(new URL('..', import.meta.url))

function getTemplates(): Template[] {
  // Using typescript to force exhaustiveness
  return Object.keys({
    'create-react-app': true
  } satisfies Record<Template, boolean>) as Template[]
}

function getTemplateDirPath(template: Template) {
  return path.resolve(reposDirPath, TEMPLATES_DIR, template)
}

function getTemplateTmpDirPath(template: Template) {
  const templateDirPath = getTemplateDirPath(template)
  return path.join(templateDirPath, TMP_DIR)
}

function getTmpDirPath(template: Template, tmpDirName: string) {
  const templateDirPath = getTemplateTmpDirPath(template)
  return path.join(templateDirPath, tmpDirName)
}

function getTemplateDirPaths(): string[] {
  return getTemplates().map(template => getTemplateDirPath(template))
}

function getTemplateTmpDirPaths(): string[] {
  return getTemplates().map(template => getTemplateTmpDirPath(template))
}

export function parseClasses(config: MultiThemePluginOptions): string[] {
  const themeNameClasses = config.themes?.map(x => x.name) ?? []
  const mediaQueries =
    config.themes?.map(x => x.mediaQuery ?? '')?.filter(x => !!x) ?? []
  const selectors = config.themes?.flatMap(x => x.selectors ?? []) ?? []
  return [...themeNameClasses, ...mediaQueries, ...selectors]
}
